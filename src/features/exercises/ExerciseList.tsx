import { useState, useMemo, useEffect, useRef } from 'react';
import { TextInput, Text, Group, Container, MultiSelect, Loader, Center, Stack, Title, Box, Pagination, Paper, Avatar, ActionIcon, Collapse, Accordion } from '@mantine/core';
import { IconSearch, IconFilter, IconHistory } from '@tabler/icons-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useExercises } from '../../hooks/useExercises';
import { Exercise } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useWorkouts } from '../../hooks/useWorkouts';
import { ExerciseItem } from '../../components/ExerciseItem';

import { useTranslation } from 'react-i18next';


// Number of exercises to show per page
const ITEMS_PER_PAGE = 20;

export function ExerciseList() {
    const { t } = useTranslation();
    const { data: exercises, isLoading } = useExercises();
    const { logs } = useWorkouts();
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const randomizedOnceRef = useRef(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const [initialExercises, setInitialExercises] = useState<Exercise[] | null>(null);
    const [search, setSearch] = useState('');
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [showFilters, setShowFilters] = useState(false);

    const loggedExercises = useMemo(() => {
        if (!exercises || !logs) return [];
        const loggedIds = new Set(logs.map(log => log.exerciseId));
        return exercises.filter(ex => loggedIds.has(ex.exerciseId));
    }, [exercises, logs]);

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
                        <Text size="xs" style={{ opacity: 0.8 }}>{t('exerciseList.library')}</Text>
                        <Title order={2} style={{ color: 'white' }}>{t('exerciseList.exercises')}</Title>
                    </div>
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

                {/* Search Bar in Header */}
                <TextInput
                    placeholder={t('exerciseList.searchPlaceholder')}
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
                    {/* Logged Exercises Accordion */}
                    {loggedExercises.length > 0 && (
                        <Paper radius="lg" shadow="sm" bg="white" style={{ overflow: 'hidden' }}>
                            <Accordion variant="separated" radius="lg" defaultValue={null}>
                                <Accordion.Item value="logged" style={{ border: 'none' }}>
                                    <Accordion.Control icon={<IconHistory size={20} color="#228be6" />}>
                                        <Text fw={500} size="sm">{t('exerciseList.recentlyLogged')} ({loggedExercises.length})</Text>
                                    </Accordion.Control>
                                    <Accordion.Panel p={0}>
                                        {loggedExercises.map((exercise, index) => (
                                            <ExerciseItem
                                                key={exercise.exerciseId}
                                                exercise={exercise}
                                                hasDivider={index < loggedExercises.length - 1}
                                            />
                                        ))}
                                    </Accordion.Panel>
                                </Accordion.Item>
                            </Accordion>
                        </Paper>
                    )}

                    {/* Filters */}
                    <Collapse in={showFilters}>
                        <Paper p="xs" radius="lg" shadow="sm" bg="white">
                            <MultiSelect
                                placeholder={t('exerciseList.filterByMuscle')}
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
                                <ExerciseItem
                                    key={exercise.exerciseId}
                                    exercise={exercise}
                                    hasDivider={index < paginatedExercises.length - 1}
                                />
                            ))}
                        </Paper>
                    ) : (
                        <Text ta="center" c="dimmed" mt="xl">{t('exerciseList.noExercisesFound')}</Text>
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
