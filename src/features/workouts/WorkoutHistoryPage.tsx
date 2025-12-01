import { Container, Title, Text, Paper, Group, Stack, Badge, Box, Avatar, Select, SegmentedControl, Accordion, Table, ThemeIcon, ActionIcon, Loader, Center } from '@mantine/core';
import { IconActivity, IconArrowLeft, IconTrash, IconCalendar, IconTrendingUp } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../../hooks/useWorkouts';
import { useExercises } from '../../hooks/useExercises';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { useState, useMemo } from 'react';
import { ConfirmDialog } from '../../components/ConfirmDialog';

export function WorkoutHistoryPage() {
    const { t } = useTranslation();
    const { logs, isLoading, deleteWorkout, isDeleting } = useWorkouts();
    const { data: exercises = [] } = useExercises();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);
    const [groupBy, setGroupBy] = useState<string>('date');
    const [filterExercise, setFilterExercise] = useState<string | null>(null);

    // Create exercise map
    const exerciseMap = exercises.reduce((acc, exercise) => {
        acc[exercise.exerciseId] = exercise.name;
        return acc;
    }, {} as Record<string, string>);

    // Get unique exercises for filter
    const uniqueExercises = useMemo(() => {
        if (!logs) return [];
        const exerciseIds = [...new Set(logs.map(log => log.exerciseId))];
        return exerciseIds.map(id => ({
            value: id,
            label: exerciseMap[id] || id
        })).sort((a, b) => a.label.localeCompare(b.label));
    }, [logs, exerciseMap]);

    // Filter and group logs
    const groupedLogs = useMemo(() => {
        if (!logs) return {};

        // Filter logs
        let filteredLogs = filterExercise
            ? logs.filter(log => log.exerciseId === filterExercise)
            : logs;

        // Sort by timestamp (newest first)
        filteredLogs = [...filteredLogs].sort((a, b) => b.timestamp - a.timestamp);

        // Group logs
        if (groupBy === 'date') {
            return filteredLogs.reduce((acc, log) => {
                const date = new Date(log.timestamp).toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric'
                });
                if (!acc[date]) acc[date] = [];
                acc[date].push(log);
                return acc;
            }, {} as Record<string, typeof logs>);
        } else {
            // Group by exercise
            return filteredLogs.reduce((acc, log) => {
                const exerciseName = exerciseMap[log.exerciseId] || log.exerciseId;
                if (!acc[exerciseName]) acc[exerciseName] = [];
                acc[exerciseName].push(log);
                return acc;
            }, {} as Record<string, typeof logs>);
        }
    }, [logs, groupBy, filterExercise, exerciseMap]);

    const handleDeleteClick = (id: string) => {
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

    // Calculate stats
    const stats = useMemo(() => {
        if (!logs) return { total: 0, exercises: 0, sets: 0 };
        const filtered = filterExercise ? logs.filter(l => l.exerciseId === filterExercise) : logs;
        return {
            total: filtered.length,
            exercises: new Set(filtered.map(l => l.exerciseId)).size,
            sets: filtered.reduce((acc, log) => acc + (log.sets?.length || 0), 0)
        };
    }, [logs, filterExercise]);

    if (isLoading) {
        return <Center style={{ height: '100vh' }}><Loader /></Center>;
    }

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 80px',
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Group justify="space-between" align="center" mb="lg">
                    <Group>
                        <ActionIcon
                            variant="subtle"
                            color="white"
                            size="lg"
                            onClick={() => navigate('/')}
                        >
                            <IconArrowLeft size={20} />
                        </ActionIcon>
                        <div>
                            <Text size="xs" style={{ opacity: 0.8 }}>Workout History</Text>
                            <Title order={2} style={{ color: 'white' }}>All Workouts</Title>
                        </div>
                    </Group>
                    <Avatar
                        src={user?.photoURL}
                        alt={user?.displayName || 'User'}
                        size="md"
                        radius="xl"
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate('/profile')}
                    >
                        {user?.displayName?.[0] || 'A'}
                    </Avatar>
                </Group>

                {/* Stats */}
                <Group justify="space-around" mt="xl">
                    <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700}>{stats.total}</Text>
                        <Text size="xs" style={{ opacity: 0.8 }}>Total Logs</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700}>{stats.exercises}</Text>
                        <Text size="xs" style={{ opacity: 0.8 }}>Exercises</Text>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                        <Text size="xl" fw={700}>{stats.sets}</Text>
                        <Text size="xs" style={{ opacity: 0.8 }}>Total Sets</Text>
                    </div>
                </Group>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '-60px' }}>
                <Stack gap="md">
                    {/* Filters */}
                    <Paper p="md" radius="sm" shadow="sm" bg="white">
                        <Stack gap="md">
                            <Group grow>
                                <SegmentedControl
                                    value={groupBy}
                                    onChange={setGroupBy}
                                    data={[
                                        { label: 'By Date', value: 'date' },
                                        { label: 'By Exercise', value: 'exercise' }
                                    ]}
                                    fullWidth
                                />
                            </Group>
                            <Select
                                placeholder="Filter by exercise"
                                data={uniqueExercises}
                                value={filterExercise}
                                onChange={setFilterExercise}
                                clearable
                                searchable
                                leftSection={<IconActivity size={16} />}
                            />
                        </Stack>
                    </Paper>

                    {/* Grouped Workouts */}
                    {Object.keys(groupedLogs).length === 0 ? (
                        <Paper p="xl" radius="sm" shadow="sm" bg="white">
                            <Text ta="center" c="dimmed">No workouts found</Text>
                        </Paper>
                    ) : (
                        Object.entries(groupedLogs).map(([group, groupLogs]) => (
                            <Paper key={group} radius="sm" shadow="sm" bg="white" style={{ overflow: 'hidden' }}>
                                <Box p="md" bg="#f8f9fa">
                                    <Group justify="space-between">
                                        <Group gap="xs">
                                            <ThemeIcon variant="light" color="blue" size="sm">
                                                {groupBy === 'date' ? <IconCalendar size={16} /> : <IconTrendingUp size={16} />}
                                            </ThemeIcon>
                                            <Text fw={600} size="sm">{group}</Text>
                                        </Group>
                                        <Badge variant="light" color="blue" size="sm">
                                            {groupLogs.length} {groupLogs.length === 1 ? 'workout' : 'workouts'}
                                        </Badge>
                                    </Group>
                                </Box>

                                <Accordion variant="contained" chevronPosition="right">
                                    {groupLogs.map((log, index) => (
                                        <Accordion.Item key={log.id || index} value={log.id || index.toString()}>
                                            <Accordion.Control>
                                                <Group justify="space-between" style={{ width: '100%' }}>
                                                    <div>
                                                        <Text fw={600} size="sm">
                                                            {groupBy === 'date'
                                                                ? exerciseMap[log.exerciseId] || log.exerciseId
                                                                : new Date(log.timestamp).toLocaleDateString(undefined, {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })
                                                            }
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {log.sets?.length || 0} sets
                                                        </Text>
                                                    </div>
                                                </Group>
                                            </Accordion.Control>
                                            <Accordion.Panel>
                                                <Stack gap="md">
                                                    <Group justify="flex-end">
                                                        <ActionIcon
                                                            variant="light"
                                                            color="red"
                                                            size="sm"
                                                            onClick={() => handleDeleteClick(log.id!)}
                                                        >
                                                            <IconTrash size={16} />
                                                        </ActionIcon>
                                                    </Group>
                                                    <Table striped highlightOnHover>
                                                        <Table.Thead>
                                                            <Table.Tr>
                                                                <Table.Th>Set</Table.Th>
                                                                <Table.Th>Weight</Table.Th>
                                                                <Table.Th>Reps</Table.Th>
                                                            </Table.Tr>
                                                        </Table.Thead>
                                                        <Table.Tbody>
                                                            {log.sets?.map((set, setIdx) => (
                                                                <Table.Tr key={setIdx}>
                                                                    <Table.Td>{setIdx + 1}</Table.Td>
                                                                    <Table.Td>{set.weight} kg</Table.Td>
                                                                    <Table.Td>{set.reps}</Table.Td>
                                                                </Table.Tr>
                                                            ))}
                                                        </Table.Tbody>
                                                    </Table>
                                                    {log.note && (
                                                        <div>
                                                            <Text fw={600} size="sm" mb="xs">Notes</Text>
                                                            <Text size="sm" c="dimmed">{log.note}</Text>
                                                        </div>
                                                    )}
                                                </Stack>
                                            </Accordion.Panel>
                                        </Accordion.Item>
                                    ))}
                                </Accordion>
                            </Paper>
                        ))
                    )}
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
        </Box>
    );
}
