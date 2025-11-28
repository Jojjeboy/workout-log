import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Image, Badge, Group, Button, Paper, Grid, Tabs, Stack, Checkbox, Box } from '@mantine/core';
import { IconArrowLeft, IconChartLine, IconList, IconHistory } from '@tabler/icons-react';
import { useExercise } from '../../hooks/useExercises';
import { WorkoutLogger } from '../workouts/WorkoutLogger';
import { useWorkouts } from '../../hooks/useWorkouts';
import { ProgressChart } from '../charts/ProgressChart';
import { WorkoutSet } from '../../types';
import { ThemeToggle } from '../../components/ThemeToggle';

export function ExerciseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: exercise, isLoading: exerciseLoading } = useExercise(id || '');
    const { logs, logWorkout, isLogging } = useWorkouts();

    // Track which instruction steps are checked
    const [checkedSteps, setCheckedSteps] = useState<Record<number, boolean>>({});

    if (exerciseLoading) return <Text>Loading...</Text>;
    if (!exercise) return <Text>Exercise not found</Text>;

    const handleSaveWorkout = (sets: WorkoutSet[]) => {
        if (!id) return;
        logWorkout({
            exerciseId: id,
            timestamp: Date.now(),
            sets,
        });
    };

    const toggleStep = (index: number) => {
        setCheckedSteps(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    return (
        <Box bg="var(--mantine-color-body)" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Compact Header */}
            <div style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                padding: '20px',
                color: 'white',
                borderBottomLeftRadius: '20px',
                borderBottomRightRadius: '20px',
                marginBottom: '20px'
            }}>
                <Container size="lg">
                    <Group justify="space-between" align="center">
                        <Button
                            variant="white"
                            leftSection={<IconArrowLeft size={16} />}
                            onClick={() => navigate(-1)}
                            size="sm"
                        >
                            Back
                        </Button>
                        <ThemeToggle />
                    </Group>
                </Container>
            </div>

            <Container size="lg">
                <Grid gutter="lg">
                    {/* Left Column - Exercise Info */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Stack gap="lg">
                            {/* Exercise Image */}
                            <Paper p="md" radius="lg" className="glass-card">
                                <Image
                                    src={exercise.gifUrl}
                                    radius="md"
                                    alt={exercise.name}
                                    mb="md"
                                />

                                {/* Exercise Name */}
                                <Title order={2} tt="capitalize" mb="md" c="#1a202c">
                                    {exercise.name}
                                </Title>

                                {/* Body Parts & Equipment */}
                                <Group mb="md">
                                    {exercise.bodyParts.map(bp => (
                                        <Badge key={bp} color="blue" size="lg">{bp}</Badge>
                                    ))}
                                    {exercise.equipments.map(eq => (
                                        <Badge key={eq} color="gray" size="lg">{eq}</Badge>
                                    ))}
                                </Group>

                                {/* Target Muscles */}
                                <Text size="md" fw={500} mb="xs" c="#1a202c">Target Muscles:</Text>
                                <Group mb="md">
                                    {exercise.targetMuscles.map(m => (
                                        <Badge key={m} variant="outline" color="pink" size="md">{m}</Badge>
                                    ))}
                                </Group>
                            </Paper>
                        </Stack>
                    </Grid.Col>

                    {/* Right Column - Workout Logging (Moved up) */}
                    <Grid.Col span={{ base: 12, md: 6 }}>
                        <Paper withBorder p="lg" radius="lg" className="glass-card">
                            <Tabs defaultValue="log">
                                <Tabs.List mb="md" grow>
                                    <Tabs.Tab value="log" leftSection={<IconList size={14} />} c="#1a202c">Log Workout</Tabs.Tab>
                                    <Tabs.Tab value="history" leftSection={<IconHistory size={14} />} c="#1a202c">History</Tabs.Tab>
                                    <Tabs.Tab value="chart" leftSection={<IconChartLine size={14} />} c="#1a202c">Progress</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="log">
                                    <WorkoutLogger onSave={handleSaveWorkout} isSaving={isLogging} />
                                </Tabs.Panel>

                                <Tabs.Panel value="history">
                                    <Text c="dimmed" ta="center">History view coming soon</Text>
                                </Tabs.Panel>

                                <Tabs.Panel value="chart">
                                    <ProgressChart logs={logs || []} exerciseId={id || ''} />
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Instructions - Below the main grid */}
                <Paper p="lg" radius="lg" className="glass-card" mt="lg">
                    <Title order={3} mb="md" c="#1a202c">Instructions</Title>
                    <Stack gap="md">
                        {exercise.instructions.map((step, index) => (
                            <Paper
                                key={index}
                                p="md"
                                radius="md"
                                withBorder
                                className="glass-card"
                                style={{
                                    transition: 'all 0.2s',
                                    backgroundColor: checkedSteps[index] ? 'rgba(76, 175, 80, 0.15)' : undefined
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
                                    />
                                    <Text
                                        size="md"
                                        c="#1a202c"
                                        style={{
                                            flex: 1,
                                            textDecoration: checkedSteps[index] ? 'line-through' : 'none',
                                            opacity: checkedSteps[index] ? 0.6 : 1,
                                            cursor: 'pointer'
                                        }}
                                        onClick={() => toggleStep(index)}
                                    >
                                        {step}
                                    </Text>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                </Paper>
            </Container>
        </Box>
    );
}
