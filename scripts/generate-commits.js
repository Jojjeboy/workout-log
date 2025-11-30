#!/usr/bin/env node
import { execSync } from 'child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const MAX_COMMITS = 100;

try {
    console.log('Generating commits.json...');

    // Get git log in JSON-friendly format
    const gitLogFormat = '%H%n%an%n%ae%n%ai%n%s%n%b%n---COMMIT-END---';
    const gitLog = execSync(
        `git log -${MAX_COMMITS} --pretty=format:"${gitLogFormat}"`,
        { encoding: 'utf-8' }
    );

    // Parse the git log output
    const commits = [];
    const commitBlocks = gitLog.split('---COMMIT-END---').filter(block => block.trim());

    for (const block of commitBlocks) {
        const lines = block.trim().split('\n');
        if (lines.length >= 5) {
            const [hash, author, , date, message, ...bodyLines] = lines;
            const body = bodyLines.join('\n').trim();

            commits.push({
                hash: hash.trim(),
                message: message.trim(),
                body: body || undefined,
                date: date.trim(),
                author: author.trim()
            });
        }
    }

    // Ensure public directory exists
    const publicDir = join(__dirname, '..', 'public');
    mkdirSync(publicDir, { recursive: true });

    // Write to public/commits.json
    const outputPath = join(publicDir, 'commits.json');
    writeFileSync(outputPath, JSON.stringify(commits, null, 2), 'utf-8');

    console.log(`✅ Generated ${commits.length} commits to ${outputPath}`);
} catch (error) {
    console.error('❌ Error generating commits:', error.message);
    // Don't fail the build if git history isn't available
    // Just create an empty commits file
    const publicDir = join(__dirname, '..', 'public');
    mkdirSync(publicDir, { recursive: true });
    const outputPath = join(publicDir, 'commits.json');
    writeFileSync(outputPath, JSON.stringify([], null, 2), 'utf-8');
    console.log('⚠️  Created empty commits.json');
}
