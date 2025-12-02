import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Title, Text, Image, Badge, Group, Button, Paper, Grid, Tabs, Stack, Checkbox, Box, Avatar, Table, ActionIcon, Modal, NumberInput } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconArrowLeft, IconCalendar, IconChartLine, IconList, IconHistory, IconPencil, IconTrash } from '@tabler/icons-react';
import { useExercise } from '../../hooks/useExercises';
import { WorkoutLogger } from '../workouts/WorkoutLogger';
import { useWorkouts } from '../../hooks/useWorkouts';
import { ProgressChart } from '../charts/ProgressChart';
import { WorkoutSet, WorkoutLog } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { usePersonalRecords } from '../../hooks/usePersonalRecords';
import { PersonalRecordsCard } from '../../components/PersonalRecordsCard';


export function ExerciseDetail() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { data: exercise, isLoading: exerciseLoading } = useExercise(id || '');
    const { logs, logWorkout, isLoading: isLogging, updateWorkout, deleteWorkout, isDeleting } = useWorkouts();
    const { user } = useAuth();
    const { prs, isLoading: prsLoading, recalculatePRs } = usePersonalRecords(id);
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
    const [workoutToDelete, setWorkoutToDelete] = useState<string | null>(null);

    // State for the unified "edit workout" modal
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editedLog, setEditedLog] = useState<WorkoutLog | null>(null);

    // Get tab from query parameters, default to 'log'
    const initialTab = searchParams.get('tab') || 'log';

    // State for tracking which instruction steps are checked
    const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});


    useEffect(() => {
        if (editingLogId && logs) {
            const logToEdit = logs.find(log => log.id === editingLogId);
            if (logToEdit) {
                // Deep copy the log to avoid mutating the original state
                setEditedLog(JSON.parse(JSON.stringify(logToEdit)));
            }
        } else {
            setEditedLog(null);
        }
    }, [editingLogId, logs]);



    if (exerciseLoading) return <Text>{t('exerciseDetail.loading')}</Text>;
    if (!exercise) return <Text>{t('exerciseDetail.notFound')}</Text>;

    const handleSaveWorkout = async (sets: WorkoutSet[], date: Date) => {
        if (!id) return;
        logWorkout({
            exerciseId: id,
            timestamp: date.getTime(),
            sets,
        });

        // Trigger PR recalculation after a short delay
        setTimeout(() => {
            recalculatePRs();
        }, 500);
    };

    const handleSaveEditedLog = () => {
        if (editedLog) {
            updateWorkout(editedLog);
            setEditingLogId(null);
        }
    };

    const handleDeleteClick = (logId: string) => {
        setWorkoutToDelete(logId);
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (workoutToDelete) {
            deleteWorkout(workoutToDelete);
            setDeleteConfirmOpen(false);
            setWorkoutToDelete(null);
        }
    };

    const toggleStep = (index: number) => {
        setCheckedSteps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <>
            <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
                {/* Banking App Header */}
                <div style={{
                    background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                    padding: '20px 20px 80px', // Extra padding for overlap
                    color: 'white',
                    borderBottomLeftRadius: '10px',
                    borderBottomRightRadius: '10px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                }}>
                    <Group justify="space-between" align="center" mb="lg">
                        <Button
                            variant="white"
                            color="dark"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate(-1)}
                            size="sm"
                            radius="xs"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
                        >
                            {t('exerciseDetail.back')}
                        </Button>
                        <Group gap="sm">
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
                    </Group>

                    <Container size="lg" px={0}>
                        <Title order={2} style={{ color: 'white', fontSize: '28px' }} tt="capitalize">
                            {exercise.name}
                        </Title>
                        <Text c="white" style={{ opacity: 0.8 }} size="sm" mt={4}>
                            {exercise.targetMuscles.join(', ')}
                        </Text>
                    </Container>
                </div>

                <Container size="lg" px="md" style={{ marginTop: '-60px' }}>
                    <Grid gutter="lg" mt="lg">
                        {/* Left Column - Exercise Info */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Stack gap="lg">
                                {/* Exercise Image */}
                                <Paper p="md" radius="sm" shadow="md" bg="white">
                                    <Image
                                        src={exercise.gifUrl}
                                        radius="sm"
                                        alt={exercise.name}
                                        mb="md"
                                    />

                                    {/* Body Parts & Equipment */}
                                    <Group mb="md">
                                        {exercise.bodyParts.map(bp => (
                                            <Badge key={bp} color="darkBlue" size="lg" radius="xs" variant="light">{bp}</Badge>
                                        ))}
                                        {exercise.equipments.map(eq => (
                                            <Badge key={eq} color="gray" size="lg" radius="xs" variant="light">{eq}</Badge>
                                        ))}
                                    </Group>
                                </Paper>
                            </Stack>
                        </Grid.Col>

                        {/* Right Column - Workout Logging */}
                        <Grid.Col span={{ base: 12, md: 6 }}>
                            <Paper withBorder p="lg" radius="sm" shadow="sm" bg="white">
                                <Tabs defaultValue={initialTab} color="darkBlue" variant="pills" radius="xs">
                                    <Tabs.List mb="md" grow>
                                        <Tabs.Tab value="log" leftSection={<IconList size={12} />} style={{ padding: '6px 10px', fontSize: '12px' }}>{t('exerciseDetail.log')}</Tabs.Tab>
                                        <Tabs.Tab value="history" leftSection={<IconHistory size={12} />} style={{ padding: '6px 10px', fontSize: '12px' }}>{t('exerciseDetail.history')}</Tabs.Tab>
                                        <Tabs.Tab value="chart" leftSection={<IconChartLine size={12} />} style={{ padding: '6px 10px', fontSize: '12px' }}>{t('exerciseDetail.progress')}</Tabs.Tab>
                                    </Tabs.List>

                                    <Tabs.Panel value="log">
                                        <WorkoutLogger onSave={handleSaveWorkout} isSaving={isLogging} onSaveSuccess={() => { }} />
                                    </Tabs.Panel>

                                    <Tabs.Panel value="history">
                                        {(() => {
                                            const exerciseLogs = logs?.filter(log => log.exerciseId === id) || [];
                                            if (exerciseLogs.length === 0) {
                                                return <Text c="dimmed" ta="center" py="xl">{t('exerciseDetail.noHistory')}</Text>;
                                            }
                                            return (
                                                <Stack gap="md">
                                                    {exerciseLogs.map((log, logIndex) => (
                                                        <Paper key={log.id || logIndex} p="md" radius="sm" withBorder bg="white">
                                                            <Group justify="space-between" mb="md">
                                                                <Text fw={600} size="sm">
                                                                    {new Date(log.timestamp).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </Text>
                                                                <Group gap="xs">
                                                                    <Badge color="blue" variant="light">{log.sets?.length || 0} {t('dashboard.sets')}</Badge>
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="blue"
                                                                        size="sm"
                                                                        onClick={() => setEditingLogId(log.id!)}
                                                                    >
                                                                        <IconPencil size={16} />
                                                                    </ActionIcon>
                                                                    <ActionIcon
                                                                        variant="subtle"
                                                                        color="red"
                                                                        size="sm"
                                                                        onClick={() => handleDeleteClick(log.id!)}
                                                                    >
                                                                        <IconTrash size={16} />
                                                                    </ActionIcon>
                                                                </Group>
                                                            </Group>
                                                            <Table striped highlightOnHover>
                                                                <Table.Thead>
                                                                    <Table.Tr>
                                                                        <Table.Th>{t('dashboard.set')}</Table.Th>
                                                                        <Table.Th>{t('dashboard.weight')}</Table.Th>
                                                                        <Table.Th>{t('dashboard.reps')}</Table.Th>
                                                                    </Table.Tr>
                                                                </Table.Thead>
                                                                <Table.Tbody>
                                                                    {log.sets?.map((set, setIdx) => (
                                                                        <Table.Tr key={setIdx}>
                                                                            <Table.Td c="#1a202c">{setIdx + 1}</Table.Td>
                                                                            <Table.Td c="#1a202c">{set.weight}</Table.Td>
                                                                            <Table.Td c="#1a202c">{set.reps}</Table.Td>
                                                                        </Table.Tr>
                                                                    ))}
                                                                </Table.Tbody>
                                                            </Table>
                                                            {log.note && (
                                                                <Stack gap="xs" mt="md">
                                                                    <Text fw={600} size="sm">{t('dashboard.notes')}</Text>
                                                                    <Text size="sm" c="dimmed">{log.note}</Text>
                                                                </Stack>
                                                            )}
                                                        </Paper>
                                                    ))}
                                                </Stack>
                                            );
                                        })()}
                                    </Tabs.Panel>

                                    <Tabs.Panel value="chart">
                                        <ProgressChart logs={logs || []} exerciseId={id || ''} />
                                    </Tabs.Panel>
                                </Tabs>
                            </Paper>
                        </Grid.Col>
                    </Grid>

                    {/* Personal Records Card */}
                    <PersonalRecordsCard prs={prs} isLoading={prsLoading} />

                    {/* Instructions - Below the main grid */}
                    <Paper p="lg" radius="sm" shadow="sm" bg="white" mt="lg">
                        <Title order={4} mb="md">{t('exerciseDetail.instructions')}</Title>
                        <Stack gap="sm">
                            {exercise.instructions.map((step, index) => (
                                <div
                                    key={index}
                                    style={{
                                        padding: '12px',
                                        borderRadius: '4px', // Very slight radius
                                        border: '1px solid #eee',
                                        backgroundColor: checkedSteps[index] ? '#f0fff4' : 'white',
                                        transition: 'all 0.2s'
                                    }}
                                >
                                    <Group wrap="nowrap" align="flex-start" gap="sm">
                                        <Checkbox
                                            checked={checkedSteps[index] || false}
                                            onChange={(event) => {
                                                event.stopPropagation();
                                                toggleStep(index);
                                            }}
                                            size="md"
                                            mt={2}
                                            color="darkBlue"
                                            radius="xs"
                                        />
                                        <Text
                                            size="sm"
                                            style={{
                                                flex: 1,
                                                textDecoration: checkedSteps[index] ? 'line-through' : 'none',
                                                opacity: checkedSteps[index] ? 0.6 : 1,
                                                cursor: 'pointer',
                                                color: '#495057'
                                            }}
                                            onClick={() => toggleStep(index)}
                                        >
                                            {step}
                                        </Text>
                                    </Group>
                                </div>
                            ))}
                        </Stack>
                    </Paper>
                </Container>
            </Box>

            {editedLog && (
                <Modal
                    opened={!!editingLogId}
                    onClose={() => setEditingLogId(null)}
                    title={t('exerciseDetail.editWorkout')}
                    size="lg"
                >
                    <Stack>
                        <DatePickerInput
                            label={t('exerciseDetail.date')}
                            value={new Date(editedLog.timestamp)}
                            onChange={(value) => {
                                if (value) {
                                    setEditedLog({ ...editedLog, timestamp: new Date(value).getTime() });
                                }
                            }}
                            maxDate={new Date()}
                            leftSection={<IconCalendar size={16} />}
                        />
                        <Table>
                            <Table.Thead>
                                <Table.Tr>
                                    <Table.Th>{t('dashboard.set')}</Table.Th>
                                    <Table.Th>{t('dashboard.weight')}</Table.Th>
                                    <Table.Th>{t('dashboard.reps')}</Table.Th>
                                    <Table.Th></Table.Th>
                                </Table.Tr>
                            </Table.Thead>
                            <Table.Tbody>
                                {editedLog.sets.map((set, index) => (
                                    <Table.Tr key={index}>
                                        <Table.Td>{index + 1}</Table.Td>
                                        <Table.Td>
                                            <NumberInput
                                                value={set.weight}
                                                onChange={(value) => {
                                                    const newSets = [...editedLog.sets];
                                                    newSets[index] = { ...newSets[index], weight: Number(value) };
                                                    setEditedLog({ ...editedLog, sets: newSets });
                                                }}
                                                min={0}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <NumberInput
                                                value={set.reps}
                                                onChange={(value) => {
                                                    const newSets = [...editedLog.sets];
                                                    newSets[index] = { ...newSets[index], reps: Number(value) };
                                                    setEditedLog({ ...editedLog, sets: newSets });
                                                }}
                                                min={0}
                                                allowDecimal={false}
                                            />
                                        </Table.Td>
                                        <Table.Td>
                                            <ActionIcon color="red" onClick={() => {
                                                const newSets = editedLog.sets.filter((_, i) => i !== index);
                                                setEditedLog({ ...editedLog, sets: newSets });
                                            }}>
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Table.Td>
                                    </Table.Tr>
                                ))}
                            </Table.Tbody>
                        </Table>
                        <Button
                            onClick={() => {
                                const newSets = [...editedLog.sets, { weight: 0, reps: 0 }];
                                setEditedLog({ ...editedLog, sets: newSets });
                            }}
                        >
                            {t('workoutLogger.addSet')}
                        </Button>
                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => setEditingLogId(null)}>{t('exerciseDetail.cancel')}</Button>
                            <Button onClick={handleSaveEditedLog}>{t('exerciseDetail.save')}</Button>
                        </Group>
                    </Stack>
                </Modal>
            )}

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
        </>
    );
}
