import { Container, Box, Title, Text, Timeline, Badge, Group, Stack, Paper, Loader, Center } from '@mantine/core';
import { IconHistory } from '@tabler/icons-react';
import { useEffect, useState } from 'react';

interface Commit {
    hash: string;
    message: string;
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
                // Fetch commits from the git log
                const response = await fetch('/api/commits');
                if (!response.ok) {
                    throw new Error('Failed to fetch commits');
                }
                const data = await response.json();
                setCommits(data);
                setError(null);
            } catch (err) {
                console.error('Error fetching commits:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch commits');
                // Fallback: Try to get commits from git command
                fetchCommitsFromGit();
            } finally {
                setIsLoading(false);
            }
        };

        const fetchCommitsFromGit = async () => {
            try {
                // This would require a backend endpoint
                // For now, we'll show a message to set up the endpoint
                console.log('Please set up a backend endpoint to fetch git commits');
            } catch (err) {
                console.error('Error:', err);
            }
        };

        fetchCommits();
    }, []);

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
                    <Group align="center" gap="md" mb="xs">
                        <IconHistory size={32} stroke={1.5} />
                        <Title order={1} style={{ margin: 0, color: 'white' }}>Changelog</Title>
                    </Group>
                    <Text size="sm" style={{ opacity: 0.9 }}>Track all updates and changes made to your workout app</Text>
                </Container>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '40px' }}>
                {error ? (
                    <Paper p="lg" radius="lg" withBorder bg="white">
                        <Text c="red" fw={500}>{error}</Text>
                        <Text size="sm" c="dimmed" mt="sm">
                            To display commits, you need to set up a backend endpoint that serves your git history.
                            The endpoint should return an array of commits with the following structure:
                        </Text>
                        <Paper p="sm" radius="sm" bg="#f1f3f5" mt="md" style={{ overflow: 'auto' }}>
                            <Text size="xs" component="pre" style={{ margin: 0, color: '#1a202c' }}>
{`[
  {
    "hash": "abc1234",
    "message": "Commit message",
    "date": "2025-01-15T10:30:00Z",
    "author": "Your Name"
  }
]`}
                            </Text>
                        </Paper>
                    </Paper>
                ) : commits.length === 0 ? (
                    <Paper p="lg" radius="lg" withBorder bg="white" ta="center">
                        <Text c="dimmed">No commits found. Make sure your git repository is properly configured.</Text>
                    </Paper>
                ) : (
                    <Stack gap="xl">
                        <Timeline active={commits.length} bulletSize={24} lineWidth={2}>
                            {commits.map((commit) => (
                                <Timeline.Item
                                    key={commit.hash}
                                    bullet={<IconHistory size={12} />}
                                    title={
                                        <Group justify="space-between" mb="xs">
                                            <Text fw={600} size="sm">{commit.message}</Text>
                                            <Badge size="sm" variant="light" color="blue">
                                                {commit.hash.substring(0, 7)}
                                            </Badge>
                                        </Group>
                                    }
                                >
                                    <Text c="dimmed" size="sm" mt={4}>
                                        {commit.author} • {new Date(commit.date).toLocaleDateString(undefined, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </Text>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                    </Stack>
                )}
            </Container>
        </Box>
    );
}
