import { Container, Box, Title, Text, Timeline, ThemeIcon, Loader, Center, Paper, Code, Collapse, Button } from '@mantine/core';
import { IconGitCommit, IconFileCode, IconChevronDown, IconChevronUp } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface Commit {
    hash: string;
    message: string;
    body?: string;
    date: string;
    author: string;
    files?: string[];
}

export function ChangelogPage() {
    const { t } = useTranslation();
    const [allCommits, setAllCommits] = useState<Commit[]>([]);
    const [displayedCount, setDisplayedCount] = useState(20);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [expandedFiles, setExpandedFiles] = useState<Record<string, boolean>>({});

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
                setAllCommits(data);
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

    // Infinite scroll effect
    useEffect(() => {
        const handleScroll = () => {
            // Check if user is near the bottom of the page
            const scrollPosition = window.innerHeight + window.scrollY;
            const bottomPosition = document.documentElement.scrollHeight - 300;

            if (scrollPosition >= bottomPosition && !isLoadingMore && displayedCount < allCommits.length) {
                setIsLoadingMore(true);
                // Simulate a small delay for better UX
                setTimeout(() => {
                    setDisplayedCount(prev => Math.min(prev + 10, allCommits.length));
                    setIsLoadingMore(false);
                }, 300);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, [displayedCount, allCommits.length, isLoadingMore]);

    const commits = allCommits.slice(0, displayedCount);

    const toggleFiles = (hash: string) => {
        setExpandedFiles(prev => ({
            ...prev,
            [hash]: !prev[hash]
        }));
    };

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
                    <Title order={1} style={{ margin: 0, color: 'white', marginBottom: '8px' }}>{t('changelog.title')}</Title>
                    <Text size="sm" style={{ opacity: 0.9 }}>{t('changelog.subtitle')}</Text>
                </Container>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '40px' }}>
                {error ? (
                    <Paper p="lg" radius="lg" withBorder bg="white">
                        <Text c="red" fw={500} mb="sm">{t('changelog.errorTitle')}</Text>
                        <Text size="sm" c="dimmed">
                            {t('changelog.errorMessage')}
                        </Text>
                    </Paper>
                ) : commits.length === 0 ? (
                    <Paper p="lg" radius="lg" withBorder bg="white" ta="center">
                        <Text c="dimmed">{t('changelog.noCommits')}</Text>
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
                                        {' •  '}
                                        <Text component="span" size="xs" c="dimmed" style={{ fontFamily: 'monospace' }}>
                                            {commit.hash.substring(0, 7)}
                                        </Text>
                                    </Text>

                                    {commit.body && (
                                        <Text c="dimmed" size="xs" mt={8} style={{ whiteSpace: 'pre-wrap', opacity: 0.7 }}>
                                            {commit.body}
                                        </Text>
                                    )}

                                    {commit.files && commit.files.length > 0 && (
                                        <Box mt="xs">
                                            <Button
                                                variant="subtle"
                                                size="xs"
                                                color="gray"
                                                leftSection={<IconFileCode size={14} />}
                                                rightSection={expandedFiles[commit.hash] ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
                                                onClick={() => toggleFiles(commit.hash)}
                                                styles={{ root: { paddingLeft: 0 } }}
                                            >
                                                {commit.files.length} {t('changelog.changedFiles')} {commit.files.length === 1 ? t('changelog.file') : t('changelog.files')}
                                            </Button>

                                            <Collapse in={expandedFiles[commit.hash]}>
                                                <Paper withBorder p="xs" bg="gray.0" mt={4}>
                                                    <Code block style={{ fontSize: '11px', lineHeight: 1.4, maxHeight: '200px', overflowY: 'auto' }}>
                                                        {commit.files.join('\n')}
                                                    </Code>
                                                </Paper>
                                            </Collapse>
                                        </Box>
                                    )}
                                </Timeline.Item>
                            ))}
                        </Timeline>

                        {/* Loading indicator and count */}
                        <Box mt="xl" style={{ textAlign: 'center' }}>
                            {isLoadingMore && (
                                <Box mb="md">
                                    <Loader size="sm" />
                                    <Text size="xs" c="dimmed" mt="xs">{t('changelog.loadingMore')}</Text>
                                </Box>
                            )}

                            <Text size="xs" c="dimmed">
                                {t('changelog.showing')} {commits.length} {t('changelog.of')} {allCommits.length} {t('changelog.commits')}
                                {displayedCount < allCommits.length && !isLoadingMore && (
                                    <Text component="span" c="blue" style={{ marginLeft: '8px' }}>
                                        {t('changelog.scrollToLoadMore')}
                                    </Text>
                                )}
                            </Text>
                        </Box>
                    </Paper>
                )}
            </Container>
        </Box>
    );
}
