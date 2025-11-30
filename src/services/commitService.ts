/**
 * Service to fetch git commits from the repository
 * This service requires a backend endpoint that can execute git commands
 * 
 * To implement this on your backend:
 * 1. Create an endpoint like GET /api/commits
 * 2. Execute: git log --oneline --pretty=format:"%H|%s|%ai|%an"
 * 3. Parse the output and return as JSON array of commits
 * 
 * Example Node.js implementation:
 * const { exec } = require('child_process');
 * app.get('/api/commits', (req, res) => {
 *   exec('git log --pretty=format:"%H|%s|%ai|%an"', (error, stdout) => {
 *     if (error) return res.status(500).json({ error: error.message });
 *     const commits = stdout.split('\n').map(line => {
 *       const [hash, message, date, author] = line.split('|');
 *       return { hash, message, date, author };
 *     });
 *     res.json(commits);
 *   });
 * });
 */

export interface Commit {
    hash: string;
    message: string;
    date: string;
    author: string;
}

export const commitService = {
    async fetchCommits(): Promise<Commit[]> {
        try {
            const response = await fetch('/api/commits');
            if (!response.ok) {
                throw new Error(`Failed to fetch commits: ${response.statusText}`);
            }
            return await response.json();
        } catch (error) {
            console.error('Error fetching commits:', error);
            throw error;
        }
    }
};
