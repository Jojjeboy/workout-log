import { useState, useMemo, useEffect, useRef } from 'react';
import { TextInput, SimpleGrid, Card, Image, Text, Badge, Group, Container, MultiSelect, Loader, Center, Stack, Title, ThemeIcon, Box, Pagination } from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import { Exercise } from '../../types';
import { ThemeToggle } from '../../components/ThemeToggle';

const ITEMS_PER_PAGE = 24;

export function ExerciseList() {
    const { data: exercises, isLoading } = useExercises();
    const location = useLocation();
    const randomizedOnceRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [initialExercises, setInitialExercises] = useState<Exercise[] | null>(null);
    const [search, setSearch] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
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
    }, [initialExercises, exercises, search, selectedMuscles]);

    const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);

    const paginatedExercises = useMemo(() => {
        const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIdx = startIdx + ITEMS_PER_PAGE;
        return filteredExercises.slice(startIdx, endIdx);
    }, [filteredExercises, currentPage]);

    const allMuscles = useMemo(() => {
        const base = initialExercises ?? exercises;
        if (!base) return [];
        const muscles = new Set<string>();
        base.forEach(ex => {
            ex.targetMuscles.forEach(m => muscles.add(m));
            ex.bodyParts.forEach(bp => muscles.add(bp));
        });
        return Array.from(muscles).sort();
    }, [initialExercises, exercises]);

    // Reset to page 1 when search or filter changes
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedMuscles]);

    // Scroll to top when page changes
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]);

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
    }, [exercises, initialExercises, location.state]);

    if (isLoading) {
        return <Center h={400}><Loader /></Center>;
    }

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE + 1;
    const endIdx = Math.min(currentPage * ITEMS_PER_PAGE, filteredExercises.length);

    return (
        <Box bg="var(--mantine-color-body)" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div ref={containerRef} />
            {/* Header Section */}
            <div style={{
                background: 'linear-gradient(135deg, #6a11cb 0%, #2575fc 100%)',
                padding: '40px 20px 80px',
                color: 'white',
                borderBottomLeftRadius: '30px',
                borderBottomRightRadius: '30px',
                marginBottom: '-60px'
            }}>
                <Group justify="space-between" align="flex-start" mb="xl">
                    <div>
                        <Text size="sm" style={{ opacity: 0.8 }}>Library</Text>
                        <Title order={1} style={{ fontSize: '28px' }}>Exercises</Title>
                    </div>
                    <ThemeToggle />
                </Group>
            </div>

            <Container size="lg" px="md">
                <Stack gap="lg">
                    {/* Search & Filter */}
                    <Card radius="lg" p="md">
                        <Stack gap="sm">
                            <TextInput
                                placeholder="Search exercises..."
                                leftSection={<IconSearch size={16} />}
                                value={search}
                                onChange={(event) => setSearch(event.currentTarget.value)}
                                radius="md"
                            />
                            <MultiSelect
                                placeholder="Filter by muscle"
                                data={allMuscles}
                                value={selectedMuscles}
                                onChange={setSelectedMuscles}
                                searchable
                                radius="md"
                            />
                        </Stack>
                    </Card>

                    {filteredExercises.length > 0 && (
                        <>
                            <Group justify="space-between">
                                <Text size="sm" c="dimmed">
                                    Showing {startIdx}-{endIdx} of {filteredExercises.length} exercises
                                </Text>
                                {totalPages > 1 && (
                                    <Pagination
                                        total={totalPages}
                                        value={currentPage}
                                        onChange={setCurrentPage}
                                        size="sm"
                                    />
                                )}
                            </Group>

                            <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
                                {paginatedExercises.map((exercise) => (
                                    <Card
                                        key={exercise.exerciseId}
                                        padding="lg"
                                        radius="lg"
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
                                            <Text fw={600} tt="capitalize" size="lg">{exercise.name}</Text>
                                            <Badge color="blue" variant="light">
                                                {exercise.bodyParts[0]}
                                            </Badge>
                                        </Group>

                                        <Text size="sm" c="dimmed" lineClamp={2} mb="md">
                                            Target: {exercise.targetMuscles.join(', ')}
                                        </Text>

                                        <Group justify="flex-end">
                                            <ThemeIcon variant="light" color="blue" radius="xl">
                                                <IconArrowRight size={16} />
                                            </ThemeIcon>
                                        </Group>
                                    </Card>
                                ))}
                            </SimpleGrid>

                            {totalPages > 1 && (
                                <Group justify="center" mt="md">
                                    <Pagination
                                        total={totalPages}
                                        value={currentPage}
                                        onChange={setCurrentPage}
                                    />
                                </Group>
                            )}
                        </>
                    )}

                    {filteredExercises.length === 0 && (
                        <Text ta="center" c="dimmed" mt="xl">No exercises found. Try syncing?</Text>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}

