import { useQuery } from '@tanstack/react-query';

export interface VersionInfo {
    branch: string;
    commitHash: string;
    commitHashShort: string;
    commitCount: number;
    latestTag: string;
    commitMessage: string;
    buildDate: string;
}

interface Commit {
    hash: string;
    message: string;
    date: string;
    author: string;
}

export function useVersion() {
    return useQuery({
        queryKey: ['version'],
        queryFn: async (): Promise<VersionInfo> => {
            // Fetch both version and commits data in parallel
            const base = import.meta.env.BASE_URL; // Hämtar t.ex. '/workout-log/'
            const [versionResponse, commitsResponse] = await Promise.all([
                fetch(`${base}version.json`),
                fetch(`${base}commits.json`)
            ]);

            if (!versionResponse.ok) {
                throw new Error('Failed to fetch version info');
            }
            if (!commitsResponse.ok) {
                throw new Error('Failed to fetch commits info');
            }

            const versionData = await versionResponse.json();
            const commitsData: Commit[] = await commitsResponse.json();

            // The single source of truth for commit count is the length of the commits array
            const commitCount = commitsData.length;

            // Get the latest commit message from commits.json, as version.json can be stale
            const latestCommitMessage = commitsData.length > 0 ? commitsData[0].message : versionData.commitMessage;

            return {
                ...versionData,
                commitCount, // Override with the accurate count
                commitMessage: latestCommitMessage, // Override with the most recent message
            };
        },
        staleTime: Infinity, // Version info never changes during runtime
        retry: false
    });
}
