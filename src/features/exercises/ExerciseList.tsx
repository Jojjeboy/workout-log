import { useState, useMemo, useEffect, useRef } from 'react';
import { TextInput, SimpleGrid, Card, Image, Text, Badge, Group, Container, MultiSelect, Loader, Center, Stack, Title, ThemeIcon, Box, Pagination } from '@mantine/core';
import { IconSearch, IconArrowRight } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import { Exercise } from '../../types';
import { ThemeToggle } from '../../components/ThemeToggle';

// Number of exercises to show per page for better performance
const ITEMS_PER_PAGE = 24;

/**
 * Exercise List Page
 * 
 * Features:
 * - Displays all available exercises in a paginated grid
 * - Search by exercise name
 * - Filter by target muscles or body parts
 * - Pagination to improve performance (only 24 exercises rendered at a time)
 * - Smooth scroll to top when changing pages
 * - Support for randomized exercise display (useful for workout variety)
 */
export function ExerciseList() {
    const { data: exercises, isLoading } = useExercises();
    const location = useLocation();
    const navigate = useNavigate();

    // Refs for tracking state that shouldn't trigger re-renders
    const randomizedOnceRef = useRef(false); // Prevent re-randomizing on every render
    const containerRef = useRef<HTMLDivElement>(null); // Reference to scroll target

    // Component state
    const [initialExercises, setInitialExercises] = useState<Exercise[] | null>(null);
    const [search, setSearch] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);

    /**
     * Filter exercises based on search term and selected muscles
     * 
     * This is memoized (cached) so it only recalculates when:
     * - The exercise list changes
     * - The search term changes
     * - The selected muscle filters change
     */
    const filteredExercises = useMemo(() => {
        const baseExercises = initialExercises ?? exercises;
        if (!baseExercises) return [];

        return baseExercises.filter((exercise) => {
            // Check if exercise name contains the search term (case-insensitive)
            const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());

            // Check if exercise targets any of the selected muscles or body parts
            // If no muscles are selected, show all exercises
            const matchesMuscle = selectedMuscles.length === 0 ||
                exercise.targetMuscles.some(muscle => selectedMuscles.includes(muscle)) ||
                exercise.bodyParts.some(bodyPart => selectedMuscles.includes(bodyPart));

            return matchesSearch && matchesMuscle;
        });
    }, [initialExercises, exercises, search, selectedMuscles]);

    // Calculate total number of pages needed
    const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);

    /**
     * Get only the exercises for the current page
     * This improves performance by not rendering all exercises at once
     */
    const paginatedExercises = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredExercises.slice(startIndex, endIndex);
    }, [filteredExercises, currentPage]);

    /**
     * Extract all unique muscles and body parts for the filter dropdown
     * Sorted alphabetically for better UX
     */
    const allMuscles = useMemo(() => {
        const baseExercises = initialExercises ?? exercises;
        if (!baseExercises) return [];

        const muscleSet = new Set<string>();
        baseExercises.forEach(exercise => {
            exercise.targetMuscles.forEach(muscle => muscleSet.add(muscle));
            exercise.bodyParts.forEach(bodyPart => muscleSet.add(bodyPart));
        });

        return Array.from(muscleSet).sort();
    }, [initialExercises, exercises]);

    // ===== EFFECTS (Side effects that run when certain values change) =====

    /**
     * Reset to page 1 whenever search or filters change
     * This prevents showing an empty page if the filtered results have fewer pages
     */
    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedMuscles]);

    /**
     * Smooth scroll to top when user changes pages
     * Provides better UX so user doesn't have to manually scroll up
     */
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [currentPage]);

    /**
     * Handle exercise randomization on first load
     * Randomization can be requested via navigation state for workout variety
     * Uses a ref to ensure randomization only happens once
     */
    useEffect(() => {
        if (!exercises) return;

        const shouldRandomize = (location.state as any)?.randomizeExercises && !randomizedOnceRef.current;

        if (shouldRandomize) {
            // Fisher-Yates shuffle using Array.sort with random comparator
            const shuffled = [...exercises].sort(() => Math.random() - 0.5);
            setInitialExercises(shuffled);
            randomizedOnceRef.current = true;
        } else if (!initialExercises) {
            setInitialExercises(exercises);
        }
    }, [exercises, initialExercises, location.state]);

    // Show loading spinner while exercises are being fetched
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

