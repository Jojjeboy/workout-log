import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Image, Badge, Group, Button, Paper, Grid, Tabs, Stack, Checkbox, Box, Avatar } from '@mantine/core';
import { IconArrowLeft, IconChartLine, IconList, IconHistory } from '@tabler/icons-react';
import { useExercise } from '../../hooks/useExercises';
import { WorkoutLogger } from '../workouts/WorkoutLogger';
import { useWorkouts } from '../../hooks/useWorkouts';
import { ProgressChart } from '../charts/ProgressChart';
import { WorkoutSet } from '../../types';
import { useAuth } from '../../hooks/useAuth';


export function ExerciseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: exercise, isLoading: exerciseLoading } = useExercise(id || '');
    const { logs, logWorkout, isLogging } = useWorkouts();
    const { user } = useAuth();

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
                        Back
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
                <Grid gutter="lg">
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
                            <Tabs defaultValue="log" color="darkBlue" variant="pills" radius="xs">
                                <Tabs.List mb="md" grow>
                                    <Tabs.Tab value="log" leftSection={<IconList size={14} />}>Log</Tabs.Tab>
                                    <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>History</Tabs.Tab>
                                    <Tabs.Tab value="chart" leftSection={<IconChartLine size={14} />}>Progress</Tabs.Tab>
                                </Tabs.List>

                                <Tabs.Panel value="log">
                                    <WorkoutLogger onSave={handleSaveWorkout} isSaving={isLogging} />
                                </Tabs.Panel>

                                <Tabs.Panel value="history">
                                    <Text c="dimmed" ta="center" py="xl">History view coming soon</Text>
                                </Tabs.Panel>

                                <Tabs.Panel value="chart">
                                    <ProgressChart logs={logs || []} exerciseId={id || ''} />
                                </Tabs.Panel>
                            </Tabs>
                        </Paper>
                    </Grid.Col>
                </Grid>

                {/* Instructions - Below the main grid */}
                <Paper p="lg" radius="sm" shadow="sm" bg="white" mt="lg">
                    <Title order={4} mb="md">Instructions</Title>
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
    );
}
