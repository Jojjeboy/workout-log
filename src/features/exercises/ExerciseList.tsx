import { useState, useMemo, useEffect, useRef } from 'react';
import { TextInput, SimpleGrid, Card, Image, Text, Badge, Group, Container, MultiSelect, Loader, Center } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import { Exercise } from '../../types';

export function ExerciseList() {
    const { data: exercises, isLoading } = useExercises();
    const location = useLocation();
    const randomizedOnceRef = useRef(false);
    const [initialExercises, setInitialExercises] = useState<Exercise[] | null>(null);
    const [search, setSearch] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const navigate = useNavigate();

    const filteredExercises = useMemo(() => {
        const base = initialExercises ?? exercises;
        if (!base) return [];
        return base.filter((ex) => {
            const matchesSearch = ex.name.toLowerCase().includes(search.toLowerCase());
            const matchesMuscle = selectedMuscles.length === 0 ||
                ex.targetMuscles.some(m => selectedMuscles.includes(m)) ||
                ex.bodyParts.some(bp => selectedMuscles.includes(bp));
            return matchesSearch && matchesMuscle;
        });
    }, [exercises, search, selectedMuscles]);

    const allMuscles = useMemo(() => {
        const base = initialExercises ?? exercises;
        if (!base) return [];
        const muscles = new Set<string>();
        base.forEach(ex => {
            ex.targetMuscles.forEach(m => muscles.add(m));
            ex.bodyParts.forEach(bp => muscles.add(bp));
        });
        return Array.from(muscles).sort();
    }, [exercises]);

    useEffect(() => {
        if (!exercises) return;

        const shouldRandomize = (location.state as any)?.randomizeExercises && !randomizedOnceRef.current;

        if (shouldRandomize) {
            const shuffled = [...exercises].sort(() => Math.random() - 0.5);
            setInitialExercises(shuffled);
            randomizedOnceRef.current = true;
        } else if (!initialExercises) {
            setInitialExercises(exercises);
        }
        // We intentionally depend on exercises and location.state here.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [exercises, (location.state as any)?.randomizeExercises]);

    if (isLoading) {
        return <Center h={200}><Loader /></Center>;
    }

    return (
        <Container size="lg" py="md">
            <Text size="xl" fw={700} mb="md">Exercises</Text>

            <Group mb="xl">
                <TextInput
                    placeholder="Search exercises..."
                    leftSection={<IconSearch size={16} />}
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    style={{ flex: 1 }}
                />
                <MultiSelect
                    placeholder="Filter by muscle"
                    data={allMuscles}
                    value={selectedMuscles}
                    onChange={setSelectedMuscles}
                    searchable
                    style={{ flex: 1 }}
                />
            </Group>

            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                {filteredExercises.map((exercise) => (
                    <Card
                        key={exercise.exerciseId}
                        className="glass-card"
                        shadow="sm"
                        padding="lg"
                        radius="md"
                        withBorder
                        style={{ cursor: 'pointer' }}
                        onClick={() => navigate(`/exercises/${exercise.exerciseId}`)}
                    >
                        <Card.Section>
                            <Image
                                src={exercise.gifUrl}
                                height={160}
                                alt={exercise.name}
                                fallbackSrc="https://placehold.co/600x400?text=No+Image"
                                loading="lazy"
                            />
                        </Card.Section>

                        <Group justify="space-between" mt="md" mb="xs">
                            <Text fw={600} tt="capitalize" className="muted-text">{exercise.name}</Text>
                            <Badge color="pink" variant="light" style={{ background: 'rgba(255,255,255,0.04)' }}>
                                {exercise.bodyParts[0]}
                            </Badge>
                        </Group>

                        <Text size="sm" className="muted-text" lineClamp={2}>
                            Target: {exercise.targetMuscles.join(', ')}
                        </Text>
                    </Card>
                ))}
            </SimpleGrid>

            {filteredExercises.length === 0 && (
                <Text ta="center" c="dimmed" mt="xl">No exercises found. Try syncing?</Text>
            )}
        </Container>
    );
}
