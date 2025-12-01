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

export function useVersion() {
    return useQuery({
        queryKey: ['version'],
        queryFn: async (): Promise<VersionInfo> => {
            const response = await fetch('/version.json');
            if (!response.ok) {
                throw new Error('Failed to fetch version info');
            }
            return response.json();
        },
        staleTime: Infinity, // Version info never changes during runtime
        retry: false
    });
}
