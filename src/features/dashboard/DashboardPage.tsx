import { Container, Grid, Text, Title, Loader, Center, Stack, Group, ThemeIcon, Badge, Paper, Box, Avatar, Accordion, Table } from '@mantine/core';
import { IconTrendingUp, IconActivity, IconArrowUpRight, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useExercises } from '../../hooks/useExercises';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { useState } from 'react';
import './DashboardPage.css';

export function DashboardPage() {
    const { t } = useTranslation();
    const { logs, isLoading, deleteWorkout, isDeleting } = useWorkouts();
    const { data: exercises = [] } = useExercises();
    const { user } = useAuth();
    const navigate = useNavigate();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setWorkoutToDelete(id);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (workoutToDelete) {
            deleteWorkout(workoutToDelete);
            setDeleteConfirmOpen(false);
            setWorkoutToDelete(null);
        }
    };

    // Create a map of exercise IDs to exercise names
    const exerciseMap = exercises.reduce((acc, exercise) => {
        acc[exercise.exerciseId] = exercise.name;
        return acc;
    }, {} as Record<string, string>);

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
                    <div>
                        <Text size="xs" style={{ opacity: 0.8 }}>{t('dashboard.welcomeBack')}</Text>
                        <Text size="sm" fw={600}>{user?.displayName || t('dashboard.athlete')}</Text>
                    </div>
                    <Group gap="sm">
                        <Avatar
                            src={user?.photoURL}
                            alt={user?.displayName || 'User'}
                            size="md"
                            radius="xl"
                            style={{ cursor: 'pointer' }}
                            onClick={() => window.location.href = '/profile'}
                        >
                            {user?.displayName?.[0] || 'A'}
                        </Avatar>
                    </Group>
                </Group>

                {/* "Balance" / Key Stat */}
                <Stack gap={0} align="center" mt="md" mb="sm">
                    <Text size="sm" style={{ opacity: 0.9 }}>{t('dashboard.totalWorkouts')}</Text>
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
                        +3 {t('dashboard.thisWeek')}
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
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">{t('dashboard.volume')}</Text>
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
                                <Text size="xs" c="dimmed" fw={600} tt="uppercase">{t('dashboard.streak')}</Text>
                                <Text size="xl" fw={700}>{stats.thisWeek} <span style={{ fontSize: '12px', fontWeight: 400 }}>{t('dashboard.days')}</span></Text>
                            </Paper>
                        </Grid.Col>
                    </Grid>

                    {/* Weekly Activity */}
                    <Paper p="lg" radius="lg" withBorder shadow="sm" bg="white">
                        <Group justify="space-between" mb="lg">
                            <Title order={4}>{t('dashboard.activity')}</Title>
                            <Badge variant="dot" color="blue">{t('dashboard.thisWeek')}</Badge>
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
                            <Title order={4}>{t('dashboard.recentTransactions')}</Title>
                            <Text size="sm" c="blue" fw={500} style={{ cursor: 'pointer' }}>{t('dashboard.seeAll')}</Text>
                        </Group>

                        <Paper radius="lg" withBorder shadow="sm" style={{ overflow: 'hidden', background: 'white' }}>
                            {(!logs || logs.length === 0) ? (
                                <Text p="xl" ta="center" c="dimmed">{t('dashboard.noWorkouts')}</Text>
                            ) : (
                                <Accordion chevronPosition="right" defaultValue="" variant="separated">
                                    {logs.slice(0, 5).map((log, index) => (
                                        <Accordion.Item key={log.id || index} value={log.id || index.toString()}>
                                            <Accordion.Control>
                                                <Group justify="space-between" style={{ width: '100%' }}>
                                                    <Group style={{ flex: 1 }}>
                                                        <ThemeIcon size={40} radius="xl" color="blue" variant="light">
                                                            <IconActivity size={20} />
                                                        </ThemeIcon>
                                                        <div>
                                                            <Text fw={600} size="sm">{t('dashboard.workoutSession')}</Text>
                                                            <Text size="xs" c="dimmed">{new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}</Text>
                                                        </div>
                                                    </Group>
                                                    <div style={{ textAlign: 'right' }}>
                                                        <Text fw={600} size="sm">{log.sets?.length || 0} {t('dashboard.sets')}</Text>
                                                        <Text size="xs" c="green" fw={500}>{t('dashboard.completed')}</Text>
                                                    </div>
                                                </Group>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                                <Stack gap="md">
                                                    <Group justify="flex-end">
                                                        <ThemeIcon
                                                            variant="light"
                                                            color="red"
                                                            size="md"
                                                            style={{ cursor: 'pointer' }}
                                                            onClick={(e) => handleDeleteClick(log.id!, e)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ThemeIcon>
                                                    </Group>
                                                    <div>
                                                        <Text fw={600} size="sm" mb="sm">
                                                            {t('dashboard.exercise')}:
                                                            <Text
                                                                component="span"
                                                                fw={600}
                                                                size="sm"
                                                                c="blue"
                                                                style={{ cursor: 'pointer', marginLeft: '8px' }}
                                                                onClick={() => navigate(`/exercises/${log.exerciseId}?tab=history`)}
                                                            >
                                                                {exerciseMap[log.exerciseId] || log.exerciseId}
                                                            </Text>
                                                        </Text>
                                                        <Table striped highlightOnHover>
                                                            <Table.Thead>
                                                                <Table.Tr>
                                                                    <Table.Th>{t('dashboard.set')}</Table.Th>
                                                                    <Table.Th>{t('dashboard.weight')}</Table.Th>
                                                                    <Table.Th>{t('dashboard.reps')}</Table.Th>
                                                                    <Table.Th>{t('dashboard.status')}</Table.Th>
                                                                </Table.Tr>
                                                            </Table.Thead>
                                                            <Table.Tbody>
                                                                {log.sets?.map((set, setIdx) => (
                                                                    <Table.Tr key={setIdx}>
                                                                        <Table.Td c="#1a202c">{setIdx + 1}</Table.Td>
                                                                        <Table.Td c="#1a202c">{set.weight}</Table.Td>
                                                                        <Table.Td c="#1a202c">{set.reps}</Table.Td>
                                                                        <Table.Td>
                                                                            <Badge
                                                                                color={'green'}
                                                                                size="sm"
                                                                                variant="light"
                                                                            >
                                                                                {t('dashboard.done')}
                                                                            </Badge>
                                                                        </Table.Td>
                                                                    </Table.Tr>
                                                                ))}
                                                            </Table.Tbody>
                                                        </Table>
                                                    </div>
                                                    {log.note && (
                                                        <div>
                                                            <Text fw={600} size="sm" mb="xs">{t('dashboard.notes')}</Text>
                                                            <Text size="sm" c="dimmed">{log.note}</Text>
                                                        </div>
                                                    )}
                                                </Stack>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            )}
                        </Paper>
                    </div>
                </Stack>
            </Container>
            <ConfirmDialog
                opened={deleteConfirmOpen}
                title={t('common.deleteWorkoutConfirmTitle')}
                message={t('common.deleteWorkoutConfirmMessage')}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                isLoading={isDeleting}
                isDangerous
            />
        </Box >
    );
}
