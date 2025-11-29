import { useState, useMemo, useEffect, useRef } from 'react';
import { TextInput, Text, Badge, Group, Container, MultiSelect, Loader, Center, Stack, Title, Box, Pagination, Paper, Avatar, Divider, ActionIcon, Collapse } from '@mantine/core';
import { IconSearch, IconChevronRight, IconFilter } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import { Exercise } from '../../types';
import { ThemeToggle } from '../../components/ThemeToggle';

// Number of exercises to show per page
const ITEMS_PER_PAGE = 20;

export function ExerciseList() {
    const { data: exercises, isLoading } = useExercises();
    const location = useLocation();
    const navigate = useNavigate();

    const randomizedOnceRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [initialExercises, setInitialExercises] = useState<Exercise[] | null>(null);
    const [search, setSearch] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const filteredExercises = useMemo(() => {
        const baseExercises = initialExercises ?? exercises;
        if (!baseExercises) return [];

        return baseExercises.filter((exercise) => {
            const matchesSearch = exercise.name.toLowerCase().includes(search.toLowerCase());
            const matchesMuscle = selectedMuscles.length === 0 ||
                exercise.targetMuscles.some(muscle => selectedMuscles.includes(muscle)) ||
                exercise.bodyParts.some(bodyPart => selectedMuscles.includes(bodyPart));

            return matchesSearch && matchesMuscle;
        });
    }, [initialExercises, exercises, search, selectedMuscles]);

    const totalPages = Math.ceil(filteredExercises.length / ITEMS_PER_PAGE);

    const paginatedExercises = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        const endIndex = startIndex + ITEMS_PER_PAGE;
        return filteredExercises.slice(startIndex, endIndex);
    }, [filteredExercises, currentPage]);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [search, selectedMuscles]);

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

    const handleToggleFilters = () => {
        if (showFilters) {
            // Reset filters when hiding
            setSelectedMuscles([]);
        }
        setShowFilters(!showFilters);
    };

    if (isLoading) {
        return <Center h={400}><Loader /></Center>;
    }

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            <div ref={containerRef} />

            {/* Banking App Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 60px',
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Group justify="space-between" align="center" mb="lg">
                    <div>
                        <Text size="xs" style={{ opacity: 0.8 }}>Library</Text>
                        <Title order={2} style={{ color: 'white' }}>Exercises</Title>
                    </div>
                    <Group gap="sm">
                        <ThemeToggle />
                    </Group>
                </Group>

                {/* Search Bar in Header */}
                <TextInput
                    placeholder="Search exercises..."
                    leftSection={<IconSearch size={16} />}
                    rightSection={
                        <ActionIcon
                            variant="transparent"
                            onClick={handleToggleFilters}
                            style={{ color: showFilters ? '#4dabf7' : 'rgba(255,255,255,0.6)' }}
                        >
                            <IconFilter size={18} />
                        </ActionIcon>
                    }
                    value={search}
                    onChange={(event) => setSearch(event.currentTarget.value)}
                    radius="xl"
                    size="md"
                    styles={{
                        input: {
                            backgroundColor: 'rgba(255,255,255,0.15)',
                            color: 'white',
                            border: 'none',
                            '::placeholder': { color: 'rgba(255,255,255,0.6)' }
                        }
                    }}
                />
            </div>

            <Container size="lg" px="md" style={{ marginTop: '-40px' }}>
                <Stack gap="md">
                    {/* Filters */}
                    <Collapse in={showFilters}>
                        <Paper p="xs" radius="lg" shadow="sm" bg="white">
                            <MultiSelect
                                placeholder="Filter by muscle"
                                data={allMuscles}
                                value={selectedMuscles}
                                onChange={setSelectedMuscles}
                                searchable
                                variant="unstyled"
                                styles={{ input: { paddingLeft: '10px' } }}
                            />
                        </Paper>
                    </Collapse>

                    {filteredExercises.length > 0 ? (
                        <Paper radius="lg" withBorder shadow="sm" style={{ overflow: 'hidden', background: 'white' }}>
                            {paginatedExercises.map((exercise, index) => (
                                <div key={exercise.exerciseId}>
                                    <div
                                        style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', cursor: 'pointer' }}
                                        onClick={() => navigate(`/exercises/${exercise.exerciseId}`)}
                                        className="hover-bg-gray"
                                    >
                                        {/* Thumbnail */}
                                        <Avatar
                                            src={exercise.gifUrl}
                                            size="lg"
                                            radius="md"
                                            color="blue"
                                            style={{ flexShrink: 0 }}
                                        >
                                            {exercise.name[0]}
                                        </Avatar>

                                        {/* Content */}
                                        <div style={{ marginLeft: '16px', flex: 1 }}>
                                            <Text fw={600} tt="capitalize" size="sm" lineClamp={1}>
                                                {exercise.name}
                                            </Text>
                                            <Text size="xs" c="dimmed" lineClamp={1}>
                                                {exercise.targetMuscles.join(', ')}
                                            </Text>
                                        </div>

                                        {/* Meta & Action */}
                                        <Group gap="xs" style={{ flexShrink: 0 }}>
                                            <Badge color="gray" variant="light" size="sm" visibleFrom="xs">
                                                {exercise.bodyParts[0]}
                                            </Badge>
                                            <IconChevronRight size={18} color="#adb5bd" />
                                        </Group>
                                    </div>

                                    {/* Indented Divider */}
                                    {index < paginatedExercises.length - 1 && (
                                        <Divider color="gray.2" style={{ marginLeft: '72px' }} />
                                    )}
                                </div>
                            ))}
                        </Paper>
                    ) : (
                        <Text ta="center" c="dimmed" mt="xl">No exercises found.</Text>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <Group justify="center" mt="md">
                            <Pagination
                                total={totalPages}
                                value={currentPage}
                                onChange={setCurrentPage}
                                size="sm"
                            />
                        </Group>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
