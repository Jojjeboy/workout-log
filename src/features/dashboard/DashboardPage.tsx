import { Container, Grid, Text, Title, Loader, Center, Stack, Group, ThemeIcon, Badge, Paper, Box, Divider, Avatar } from '@mantine/core';
import { IconTrendingUp, IconActivity, IconArrowUpRight, IconChevronRight } from '@tabler/icons-react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useAuth } from '../../hooks/useAuth';
import { ThemeToggle } from '../../components/ThemeToggle';
import './DashboardPage.css';

export function DashboardPage() {
    const { logs, isLoading } = useWorkouts();
    const { user } = useAuth();

    const stats = {
        totalWorkouts: logs?.length || 0,
        totalExercises: logs ? new Set(logs.map(l => l.exerciseId)).size : 0,
        totalSets: logs?.reduce((acc, log) => acc + (log.sets?.length || 0), 0) || 0,
        thisWeek: logs?.filter(log => {
            const now = Date.now();
            const week = 7 * 24 * 60 * 60 * 1000;
            return log.timestamp > now - week;
        }).length || 0,
    };

    if (isLoading) {
        return <Center style={{ height: 400 }}><Loader /></Center>;
    }

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Banking App Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 60px', // Extra padding bottom for the curve/overlap
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                {/* Top Bar */}
                <Group justify="space-between" align="center" mb="xl">
                    <Group gap="xs">
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName || 'User'}
                            radius="xl"
                            size="md"
                            color="white"
                            bg="rgba(255,255,255,0.2)"
                        >
                            {user?.displayName?.[0] || 'A'}
                        </Avatar>
                        <div>
                            <Text size="xs" style={{ opacity: 0.8 }}>Welcome back,</Text>
                            <Text size="sm" fw={600}>{user?.displayName || 'Athlete'}</Text>
                        </div>
                    </Group>
                    <Group gap="sm">
                        <ThemeToggle />
                    </Group>
                </Group>

                {/* "Balance" / Key Stat */}
                <Stack gap={0} align="center" mt="md" mb="sm">
                    <Text size="sm" style={{ opacity: 0.9 }}>Total Workouts</Text>
                    <Title order={1} style={{ fontSize: '42px', fontWeight: 700, letterSpacing: '-1px' }}>
                        {stats.totalWorkouts}
                    </Title>
                    <Badge
                        variant="light"
                        color="green"
                        size="lg"
                        radius="sm"
                        mt="xs"
                        leftSection={<IconArrowUpRight size={14} />}
                        style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#4ade80' }}
                    >
                        +3 this week
                    </Badge>
                </Stack>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '-40px' }}>
                <Stack gap="xl">
                    {/* Stats Grid - Overlapping Header */}
                    <Grid gutter="md">
                        <Grid.Col span={6}>
                            <Paper p="md" radius="lg" shadow="md" style={{ background: 'white' }}>
                                <Group justify="space-between" align="flex-start" mb="xs">
                                    <ThemeIcon size="lg" radius="md" color="blue" variant="light">
                                        <IconActivity size={20} />
                                    </ThemeIcon>
                                    <Text size="xs" fw={700} c="green">+12%</Text>
                                </Group>
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">Volume</Text>
                                <Text size="xl" fw={700}>{stats.totalSets}</Text>
                            </Paper>
                        </Grid.Col>
                        <Grid.Col span={6}>
                            <Paper p="md" radius="lg" shadow="md" style={{ background: 'white' }}>
                                <Group justify="space-between" align="flex-start" mb="xs">
                                    <ThemeIcon size="lg" radius="md" color="orange" variant="light">
                                        <IconTrendingUp size={20} />
                                    </ThemeIcon>
                                    <Text size="xs" fw={700} c="red">-2%</Text>
                                </Group>
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">Streak</Text>
                                <Text size="xl" fw={700}>{stats.thisWeek} <span style={{ fontSize: '12px', fontWeight: 400 }}>days</span></Text>
                            </Paper>
                        </Grid.Col>
                    </Grid>

                    {/* Weekly Activity */}
                    <Paper p="lg" radius="lg" withBorder shadow="sm" bg="white">
                        <Group justify="space-between" mb="lg">
                            <Title order={4}>Activity</Title>
                            <Badge variant="dot" color="blue">This Week</Badge>
                        </Group>
                        <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', paddingBottom: '10px' }}>
                            {[40, 70, 30, 85, 50, 65, 90].map((h, i) => (
                                <div key={i} style={{ width: '10%', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '100%', height: `${h}%`, background: i === 6 ? '#1e3c72' : '#f1f3f5', borderRadius: '6px' }} />
                                    <Text size="xs" c="dimmed">{['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}</Text>
                                </div>
                            ))}
                        </div>
                    </Paper>

                    {/* Recent Workouts List */}
                    <div>
                        <Group justify="space-between" mb="md" px="xs">
                            <Title order={4}>Recent Transactions</Title>
                            <Text size="sm" c="blue" fw={500} style={{ cursor: 'pointer' }}>See All</Text>
                        </Group>

                        <Paper radius="lg" withBorder shadow="sm" style={{ overflow: 'hidden', background: 'white' }}>
                            {logs?.slice(0, 5).map((log, index) => (
                                <div key={index}>
                                    <div style={{ padding: '16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }} className="hover-bg-gray">
                                        <ThemeIcon size={40} radius="xl" color="blue" variant="light" style={{ flexShrink: 0 }}>
                                            <IconActivity size={20} />
                                        </ThemeIcon>

                                        <div style={{ marginLeft: '16px', flex: 1 }}>
                                            <Text fw={600} size="sm">Workout Session</Text>
                                            <Text size="xs" c="dimmed">{new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                        </div>

                                        <div style={{ textAlign: 'right', marginRight: '16px' }}>
                                            <Text fw={600} size="sm">{log.sets?.length || 0} Sets</Text>
                                            <Text size="xs" c="green" fw={500}>Completed</Text>
                                        </div>

                                        <IconChevronRight size={18} color="#adb5bd" />
                                    </div>
                                    {index < (logs?.slice(0, 5).length || 0) - 1 && (
                                        <Divider color="gray.2" style={{ marginLeft: '72px' }} />
                                    )}
                                </div>
                            ))}
                            {(!logs || logs.length === 0) && (
                                <Text p="xl" ta="center" c="dimmed">No workouts logged yet.</Text>
                            )}
                        </Paper>
                    </div>
                </Stack>
            </Container>
        </Box>
    );
}
