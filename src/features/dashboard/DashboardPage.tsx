import { Container, Grid, Card, Text, Title, Loader, Center, Stack, Group, ThemeIcon, Divider, Badge } from '@mantine/core';
import { IconFlame, IconTrendingUp, IconActivity, IconCalendar } from '@tabler/icons-react';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useAuth } from '../../hooks/useAuth';
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

    const avgSetsPerWorkout = stats.totalWorkouts > 0 ? (stats.totalSets / stats.totalWorkouts).toFixed(1) : 0;
    const lastWorkoutDate = logs && logs.length > 0 ? new Date(logs[0].timestamp).toLocaleDateString() : 'No workouts yet';

    if (isLoading) {
        return <Center style={{ height: 400 }}><Loader /></Center>;
    }

    return (
        <Container size="lg" py="xl" px="md">
            <Stack gap="xl">
                {/* Welcome Header */}
                <div>
                    <Title order={2} className="app-title-gradient" mb="xs">Welcome back, {user?.displayName || 'Athlete'}</Title>
                    <Text className="muted-text" size="sm">Track your progress and stay motivated</Text>
                </div>

                {/* Stats Grid - 4 columns */}
                <Grid gutter="lg">
                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card className="glass-card stat-card" p="lg">
                            <Card.Section p="lg" pb={0}>
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap={8}>
                                        <Text size="sm" fw={500} className="muted-text">Total Workouts</Text>
                                        <Text size="32" fw={700} className="app-title-gradient">{stats.totalWorkouts}</Text>
                                    </Stack>
                                    <ThemeIcon size={50} variant="light" color="blue" radius="lg" className="stat-card-icon">
                                        <IconActivity size={24} />
                                    </ThemeIcon>
                                </Group>
                            </Card.Section>
                            <Divider my="sm" />
                            <Card.Section p="lg" pt="sm">
                                <Stack gap={2}>
                                    <Text size="xs" className="muted-text">This week</Text>
                                    <Badge size="sm" variant="light">{stats.thisWeek} sessions</Badge>
                                </Stack>
                            </Card.Section>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card className="glass-card stat-card" p="lg">
                            <Card.Section p="lg" pb={0}>
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap={8}>
                                        <Text size="sm" fw={500} className="muted-text">Unique Exercises</Text>
                                        <Text size="32" fw={700} className="app-title-gradient">{stats.totalExercises}</Text>
                                    </Stack>
                                    <ThemeIcon size={50} variant="light" color="purple" radius="lg" className="stat-card-icon">
                                        <IconTrendingUp size={24} />
                                    </ThemeIcon>
                                </Group>
                            </Card.Section>
                            <Divider my="sm" />
                            <Card.Section p="lg" pt="sm">
                                <Stack gap={2}>
                                    <Text size="xs" className="muted-text">Variety in training</Text>
                                    <Badge size="sm" variant="light" color="purple">Exercises</Badge>
                                </Stack>
                            </Card.Section>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card className="glass-card stat-card" p="lg">
                            <Card.Section p="lg" pb={0}>
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap={8}>
                                        <Text size="sm" fw={500} className="muted-text">Total Sets</Text>
                                        <Text size="32" fw={700} className="app-title-gradient">{stats.totalSets}</Text>
                                    </Stack>
                                    <ThemeIcon size={50} variant="light" color="orange" radius="lg" className="stat-card-icon">
                                        <IconFlame size={24} />
                                    </ThemeIcon>
                                </Group>
                            </Card.Section>
                            <Divider my="sm" />
                            <Card.Section p="lg" pt="sm">
                                <Stack gap={2}>
                                    <Text size="xs" className="muted-text">{avgSetsPerWorkout} per workout</Text>
                                    <Badge size="sm" variant="light" color="orange">Total</Badge>
                                </Stack>
                            </Card.Section>
                        </Card>
                    </Grid.Col>

                    <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                        <Card className="glass-card stat-card" p="lg">
                            <Card.Section p="lg" pb={0}>
                                <Group justify="space-between" align="flex-start">
                                    <Stack gap={8}>
                                        <Text size="sm" fw={500} className="muted-text">Last Activity</Text>
                                        <Text size="32" fw={700} className="app-title-gradient">✓</Text>
                                    </Stack>
                                    <ThemeIcon size={50} variant="light" color="green" radius="lg" className="stat-card-icon">
                                        <IconCalendar size={24} />
                                    </ThemeIcon>
                                </Group>
                            </Card.Section>
                            <Divider my="sm" />
                            <Card.Section p="lg" pt="sm">
                                <Stack gap={2}>
                                    <Text size="xs" className="muted-text">{lastWorkoutDate}</Text>
                                    <Badge size="sm" variant="light" color="green">Active</Badge>
                                </Stack>
                            </Card.Section>
                        </Card>
                    </Grid.Col>
                </Grid>

                {/* Quick Actions */}
                <div>
                    <Title order={4} mb="md">Quick Access</Title>
                    <Grid gutter="lg">
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Card className="glass-card" p="lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <Stack gap="xs">
                                    <Text fw={600} size="md">Start Workout</Text>
                                    <Text size="sm" className="muted-text">Log a new exercise session and track your progress</Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                        <Grid.Col span={{ base: 12, sm: 6 }}>
                            <Card className="glass-card" p="lg" style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'} onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
                                <Stack gap="xs">
                                    <Text fw={600} size="md">Browse Exercises</Text>
                                    <Text size="sm" className="muted-text">Find and explore available exercises for your training</Text>
                                </Stack>
                            </Card>
                        </Grid.Col>
                    </Grid>
                </div>
            </Stack>
        </Container>
    );
}
