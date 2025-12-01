#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_COMMITS = 10000;

// Helper to safely execute git commands
function gitCommand(cmd, fallback = '') {
    try {
        return execSync(cmd, { encoding: 'utf-8' }).trim();
    } catch (error) {
        return fallback;
    }
}

try {
    console.log('Generating commits.json and version.json...');

    // === Generate version.json with git metadata ===
    const branch = gitCommand('git rev-parse --abbrev-ref HEAD', 'unknown');
    const commitHash = gitCommand('git rev-parse HEAD', 'unknown');
    const commitHashShort = gitCommand('git rev-parse --short HEAD', 'unknown');
    const commitCount = gitCommand('git rev-list --count HEAD', '0');
    const latestTag = gitCommand('git describe --tags --abbrev=0', 'v0.0.0');
    const timestamp = new Date().toISOString();

    const versionInfo = {
        branch,
        commitHash,
        commitHashShort,
        commitCount: parseInt(commitCount),
        latestTag,
        buildDate: timestamp
    };

    // Ensure public directory exists
    const publicDir = join(__dirname, '..', 'public');
    mkdirSync(publicDir, { recursive: true });

    // Write version.json
    const versionPath = join(publicDir, 'version.json');
    writeFileSync(versionPath, JSON.stringify(versionInfo, null, 2), 'utf-8');
    console.log(`✅ Generated version info to ${versionPath}`);
    console.log(`   Branch: ${branch}, Hash: ${commitHashShort}, Tag: ${latestTag}, Commits: ${commitCount}`);

    // === Generate commits.json ===
    // Get git log in JSON-friendly format
    // We use specific delimiters to reliably parse the output
    // ---COMMIT-START--- separates commits
    // ---BODY-END--- separates the commit message body from the file list (which comes from --name-only)
    const gitLogFormat = '---COMMIT-START---%n%H%n%an%n%ae%n%ai%n%s%n%b%n---BODY-END---';
    const gitLog = execSync(
        `git log -${MAX_COMMITS} --pretty=format:"${gitLogFormat}" --name-only`,
        { encoding: 'utf-8' }
    );

    // Parse the git log output
    const commits = [];
    // Split by commit start delimiter, ignore the first empty chunk if any
    const commitBlocks = gitLog.split('---COMMIT-START---').filter(block => block.trim());

    for (const block of commitBlocks) {
        // Split into metadata+body and files parts
        const [metaAndBody, filesPart] = block.split('---BODY-END---');

        if (!metaAndBody) continue;

        const lines = metaAndBody.trim().split('\n');
        if (lines.length >= 5) {
            const [hash, author, email, date, message, ...bodyLines] = lines;
            const body = bodyLines.join('\n').trim();

            // Parse files
            let files = [];
            if (filesPart) {
                files = filesPart
                    .trim()
                    .split('\n')
                    .map(f => f.trim())
                    .filter(f => f.length > 0);
            }

            commits.push({
                hash: hash.trim(),
                message: message.trim(),
                body: body || undefined,
                date: date.trim(),
                author: author.trim(),
                files: files
            });
        }
    }

    // Write to public/commits.json
    const outputPath = join(publicDir, 'commits.json');
    writeFileSync(outputPath, JSON.stringify(commits, null, 2), 'utf-8');

    console.log(`✅ Generated ${commits.length} commits to ${outputPath}`);
} catch (error) {
    console.error('❌ Error generating commits:', error.message);
    // Don't fail the build if git history isn't available
    // Just create empty files
    const publicDir = join(__dirname, '..', 'public');
    mkdirSync(publicDir, { recursive: true });

    const outputPath = join(publicDir, 'commits.json');
    writeFileSync(outputPath, JSON.stringify([], null, 2), 'utf-8');

    const versionPath = join(publicDir, 'version.json');
    writeFileSync(versionPath, JSON.stringify({
        branch: 'unknown',
        commitHash: 'unknown',
        commitHashShort: 'unknown',
        commitCount: 0,
        latestTag: 'v0.0.0',
        buildDate: new Date().toISOString()
    }, null, 2), 'utf-8');

    console.log('⚠️  Created empty commits.json and version.json');
}
