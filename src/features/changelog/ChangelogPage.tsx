import { Container, Box, Title, Text, Timeline, ThemeIcon, Loader, Center, Paper } from '@mantine/core';
import { IconGitCommit } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface Commit {
    hash: string;
    message: string;
    body?: string;
    date: string;
    author: string;
}

export function ChangelogPage() {
    const [commits, setCommits] = useState<Commit[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchCommits = async () => {
            try {
                setIsLoading(true);
                // Fetch commits from the static JSON file
                const response = await fetch('/commits.json');
                if (!response.ok) {
                    throw new Error('Failed to fetch commits');
                }
                const data = await response.json();
                setCommits(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching commits:', err);
                setError(err instanceof Error ? err.message : 'Failed to load commits');
            } finally {
                setIsLoading(false);
            }
        };

        fetchCommits();
    }, []);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
        } else if (diffHours < 24) {
            return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
        } else if (diffDays < 7) {
            return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        } else {
            return date.toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        }
    };

    if (isLoading) {
        return <Center style={{ height: 400 }}><Loader /></Center>;
    }

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '40px 20px',
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Container size="lg" px="md">
                    <Title order={1} style={{ margin: 0, color: 'white', marginBottom: '8px' }}>Changelog</Title>
                    <Text size="sm" style={{ opacity: 0.9 }}>Track all updates and changes to the workout app</Text>
                </Container>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '40px' }}>
                {error ? (
                    <Paper p="lg" radius="lg" withBorder bg="white">
                        <Text c="red" fw={500} mb="sm">⚠️ {error}</Text>
                        <Text size="sm" c="dimmed">
                            The commits.json file could not be loaded. Make sure to run the build script to generate it.
                        </Text>
                    </Paper>
                ) : commits.length === 0 ? (
                    <Paper p="lg" radius="lg" withBorder bg="white" ta="center">
                        <Text c="dimmed">No commits found in the changelog.</Text>
                    </Paper>
                ) : (
                    <Paper p="lg" radius="lg" withBorder bg="white">
                        <Timeline active={1} bulletSize={28} lineWidth={2} color="blue">
                            {commits.map((commit, index) => (
                                <Timeline.Item
                                    key={commit.hash}
                                    bullet={
                                        <ThemeIcon
                                            size={22}
                                            variant="filled"
                                            color={index === 0 ? 'blue' : 'gray'}
                                            radius="xl"
                                        >
                                            <IconGitCommit size={14} />
                                        </ThemeIcon>
                                    }
                                    title={
                                        <div style={{ marginBottom: '4px' }}>
                                            <Text fw={600} size="sm" style={{ lineHeight: 1.4 }}>
                                                {commit.message}
                                            </Text>
                                        </div>
                                    }
                                >
                                    <Text c="dimmed" size="sm" mt={4}>
                                        <Text component="span" c={index === 0 ? 'blue' : 'dimmed'} fw={500}>
                                            {commit.author}
                                        </Text>
                                        {' • '}
                                        <Text component="span" size="xs">
                                            {formatDate(commit.date)}
                                        </Text>
                                        {' • '}
                                        <Text component="span" size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            {commit.hash.substring(0, 7)}
                                        </Text>
                                    </Text>
                                    {commit.body && (
                                        <Text c="dimmed" size="xs" mt={8} style={{ whiteSpace: 'pre-wrap', opacity: 0.7 }}>
                                            {commit.body}
                                        </Text>
                                    )}
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}

