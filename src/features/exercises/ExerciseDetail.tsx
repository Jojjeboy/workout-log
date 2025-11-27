import { useParams, useNavigate } from 'react-router-dom';
import { Container, Title, Text, Image, Badge, Group, Button, List, ThemeIcon, Paper, Grid, Tabs } from '@mantine/core';
import { IconArrowLeft, IconCheck, IconChartLine, IconList, IconHistory } from '@tabler/icons-react';
import { useExercise } from '../../hooks/useExercises';
import { WorkoutLogger } from '../workouts/WorkoutLogger';
import { useWorkouts } from '../../hooks/useWorkouts';
import { ProgressChart } from '../charts/ProgressChart';
import { WorkoutSet } from '../../types';

export function ExerciseDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: exercise, isLoading: exerciseLoading } = useExercise(id || '');
    const { logs, logWorkout, isLogging } = useWorkouts();

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

    return (
        <Container size="lg" py="md">
            <Button
                variant="subtle"
                leftSection={<IconArrowLeft size={16} />}
                onClick={() => navigate(-1)}
                mb="md"
            >
                Back to Exercises
            </Button>

            <Grid>
                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Image
                        src={exercise.gifUrl}
                        radius="md"
                        alt={exercise.name}
                        className="border border-gray-200"
                        mb="md"
                    />

                    <Paper withBorder p="md" radius="md">
                        <Tabs defaultValue="log">
                            <Tabs.List mb="md">
                                <Tabs.Tab value="log" leftSection={<IconList size={14} />}>Log</Tabs.Tab>
                                <Tabs.Tab value="history" leftSection={<IconHistory size={14} />}>History</Tabs.Tab>
                                <Tabs.Tab value="chart" leftSection={<IconChartLine size={14} />}>Progress</Tabs.Tab>
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

                <Grid.Col span={{ base: 12, md: 6 }}>
                    <Title order={2} tt="capitalize" mb="md">{exercise.name}</Title>

                    <Group mb="md">
                        {exercise.bodyParts.map(bp => (
                            <Badge key={bp} color="blue" size="lg">{bp}</Badge>
                        ))}
                        {exercise.equipments.map(eq => (
                            <Badge key={eq} color="gray" size="lg">{eq}</Badge>
                        ))}
                    </Group>

                    <Text size="lg" fw={500} mb="xs">Target Muscles:</Text>
                    <Group mb="xl">
                        {exercise.targetMuscles.map(m => (
                            <Badge key={m} variant="outline" color="pink">{m}</Badge>
                        ))}
                    </Group>

                    <Text size="lg" fw={500} mb="xs">Instructions:</Text>
                    <List
                        spacing="sm"
                        size="sm"
                        center
                        icon={
                            <ThemeIcon color="teal" size={24} radius="xl">
                                <IconCheck size={16} />
                            </ThemeIcon>
                        }
                    >
                        {exercise.instructions.map((step, index) => (
                            <List.Item key={index}>{step}</List.Item>
                        ))}
                    </List>
                </Grid.Col>
            </Grid>
        </Container>
    );
}
