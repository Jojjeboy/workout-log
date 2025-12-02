import { useState, useMemo, useEffect } from 'react';
import { Box, Container, Stack, Title, Group, Button, TextInput, Textarea, Paper, Text, ActionIcon, Badge, Modal, NumberInput, MultiSelect, Avatar } from '@mantine/core';
import { IconArrowLeft, IconPlus, IconTrash, IconGripVertical, IconSearch, IconPencil } from '@tabler/icons-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCreateRoutine, useUpdateRoutine, useRoutine } from '../../hooks/useRoutines';
import { useExercises } from '../../hooks/useExercises';
import { useTranslation } from 'react-i18next';
import { RoutineExercise, Exercise } from '../../types';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableExerciseItemProps {
    exercise: RoutineExercise;
    exerciseDetails: Exercise | undefined;
    onRemove: () => void;
    onEdit: () => void;
}

function SortableExerciseItem({ exercise, exerciseDetails, onRemove, onEdit }: SortableExerciseItemProps) {

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
    } = useSortable({ id: exercise.exerciseId });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <Paper ref={setNodeRef} style={style} p="sm" radius="sm" withBorder>
            <Group justify="space-between" align="center" wrap="nowrap">
                <Group gap="sm" style={{ flex: 1 }}>
                    <ActionIcon {...attributes} {...listeners} variant="subtle" color="gray" style={{ cursor: 'grab', touchAction: 'none' }}>
                        <IconGripVertical size={18} />
                    </ActionIcon>
                    <div style={{ flex: 1 }}>
                        <Group gap="sm" wrap="nowrap" mb={4}>
                            {exerciseDetails?.gifUrl && (
                                <Avatar src={exerciseDetails.gifUrl} radius="sm" size="md" />
                            )}
                            <div>
                                <Text fw={500} tt="capitalize" lineClamp={1}>{exerciseDetails?.name || exercise.exerciseId}</Text>
                                {(exercise.suggestedSets || exercise.suggestedReps || exercise.suggestedWeight) && (
                                    <Group gap="xs" mt={2}>
                                        {exercise.suggestedSets && (
                                            <Badge size="xs" variant="light" color="gray">{exercise.suggestedSets} sets</Badge>
                                        )}
                                        {exercise.suggestedReps && (
                                            <Badge size="xs" variant="light" color="gray">{exercise.suggestedReps} reps</Badge>
                                        )}
                                        {exercise.suggestedWeight && (
                                            <Badge size="xs" variant="light" color="gray">{exercise.suggestedWeight} kg</Badge>
                                        )}
                                    </Group>
                                )}
                            </div>
                        </Group>
                    </div>
                </Group>
                <Group gap="xs">
                    <ActionIcon variant="subtle" color="blue" onClick={onEdit}>
                        <IconPencil size={18} />
                    </ActionIcon>
                    <ActionIcon color="red" variant="subtle" onClick={onRemove}>
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            </Group>
        </Paper>
    );
}

export function CreateRoutinePage() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const isEditMode = !!id;

    const createMutation = useCreateRoutine();
    const updateMutation = useUpdateRoutine();
    const { data: existingRoutine } = useRoutine(id);
    const { data: exercises } = useExercises();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [routineExercises, setRoutineExercises] = useState<RoutineExercise[]>([]);
    const [exercisePickerOpen, setExercisePickerOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [editingExercise, setEditingExercise] = useState<RoutineExercise | null>(null);
    const [suggestedSets, setSuggestedSets] = useState<number | string>('');
    const [suggestedReps, setSuggestedReps] = useState<number | string>('');
    const [suggestedWeight, setSuggestedWeight] = useState<number | string>('');

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            setRoutineExercises((items) => {
                const oldIndex = items.findIndex(i => i.exerciseId === active.id);
                const newIndex = items.findIndex(i => i.exerciseId === over.id);
                const reordered = arrayMove(items, oldIndex, newIndex);
                return reordered.map((item: RoutineExercise, index: number) => ({ ...item, order: index }));
            });
        }
    };

    const addExercise = (exercise: Exercise) => {
        if (routineExercises.some(e => e.exerciseId === exercise.exerciseId)) {
            return; // Already added
        }

        setRoutineExercises([...routineExercises, {
            exerciseId: exercise.exerciseId,
            order: routineExercises.length,
        }]);
        setExercisePickerOpen(false);
        setSearchQuery('');
    };

    const removeExercise = (exerciseId: string) => {
        setRoutineExercises(routineExercises.filter(e => e.exerciseId !== exerciseId));
    };

    const openEditSuggestions = (exercise: RoutineExercise) => {
        setEditingExercise(exercise);
        setSuggestedSets(exercise.suggestedSets || '');
        setSuggestedReps(exercise.suggestedReps || '');
        setSuggestedWeight(exercise.suggestedWeight || '');
    };

    const saveSuggestions = () => {
        if (!editingExercise) return;

        setRoutineExercises(routineExercises.map(e =>
            e.exerciseId === editingExercise.exerciseId
                ? {
                    ...e,
                    suggestedSets: suggestedSets ? Number(suggestedSets) : undefined,
                    suggestedReps: suggestedReps ? Number(suggestedReps) : undefined,
                    suggestedWeight: suggestedWeight ? Number(suggestedWeight) : undefined,
                }
                : e
        ));

        setEditingExercise(null);
        setSuggestedSets('');
        setSuggestedReps('');
        setSuggestedWeight('');
    };

    // Load existing routine data when in edit mode
    useEffect(() => {
        if (isEditMode && existingRoutine) {
            setName(existingRoutine.name);
            setDescription(existingRoutine.description || '');
            setRoutineExercises(existingRoutine.exercises);
        }
    }, [isEditMode, existingRoutine]);

    const handleSubmit = async () => {
        if (!name.trim() || routineExercises.length === 0) return;

        try {
            if (isEditMode && id) {
                await updateMutation.mutateAsync({
                    id,
                    updates: {
                        name: name.trim(),
                        description: description.trim() || undefined,
                        exercises: routineExercises,
                    },
                });
            } else {
                await createMutation.mutateAsync({
                    name: name.trim(),
                    description: description.trim() || undefined,
                    exercises: routineExercises,
                });
            }
            navigate('/routines');
        } catch (error) {
            console.error(`Failed to ${isEditMode ? 'update' : 'create'} routine:`, error);
        }
    };

    const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
    const [selectedMuscles, setSelectedMuscles] = useState<string[]>([]);

    const allBodyParts = useMemo(() => {
        if (!exercises) return [];
        const bodyPartSet = new Set<string>();
        exercises.forEach(exercise => {
            exercise.bodyParts.forEach(bodyPart => bodyPartSet.add(bodyPart));
        });
        return Array.from(bodyPartSet).sort();
    }, [exercises]);

    const allMuscles = useMemo(() => {
        if (!exercises) return [];
        const muscleSet = new Set<string>();
        exercises.forEach(exercise => {
            exercise.targetMuscles.forEach(muscle => muscleSet.add(muscle));
        });
        return Array.from(muscleSet).sort();
    }, [exercises]);

    const filteredExercises = useMemo(() => {
        if (!exercises) return [];
        return exercises.filter((exercise) => {
            const matchesSearch = exercise.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesBodyPart = selectedBodyParts.length === 0 ||
                exercise.bodyParts.some(bodyPart => selectedBodyParts.includes(bodyPart));
            const matchesMuscle = selectedMuscles.length === 0 ||
                exercise.targetMuscles.some(muscle => selectedMuscles.includes(muscle));

            return matchesSearch && matchesBodyPart && matchesMuscle;
        });
    }, [exercises, searchQuery, selectedBodyParts, selectedMuscles]);

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Blue Gradient Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 60px',
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
                        onClick={() => navigate('/routines')}
                        size="sm"
                        radius="xs"
                        style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
                    >
                        {t('exerciseDetail.back')}
                    </Button>
                </Group>

                <Title order={2} style={{ color: 'white' }}>
                    {isEditMode ? t('routines.editTitle') : t('routines.createTitle')}
                </Title>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '-40px' }}>
                <Paper p="lg" radius="lg" shadow="sm" bg="white">
                    <Stack gap="md">
                        <TextInput
                            label={t('routines.name')}
                            placeholder={t('routines.namePlaceholder')}
                            value={name}
                            onChange={(e) => setName(e.currentTarget.value)}
                            required
                            size="md"
                        />

                        <Textarea
                            label={t('routines.description')}
                            placeholder={t('routines.descriptionPlaceholder')}
                            value={description}
                            onChange={(e) => setDescription(e.currentTarget.value)}
                            minRows={3}
                        />

                        <div>
                            <Group justify="space-between" mb="sm">
                                <Text fw={500}>{t('routines.exercises')} ({routineExercises.length})</Text>
                                <Button
                                    leftSection={<IconPlus size={16} />}
                                    onClick={() => setExercisePickerOpen(true)}
                                    size="sm"
                                    variant="light"
                                    color="darkBlue"
                                    radius="xs"
                                >
                                    {t('routines.addExercise')}
                                </Button>
                            </Group>

                            {routineExercises.length > 0 ? (
                                <DndContext
                                    sensors={sensors}
                                    collisionDetection={closestCenter}
                                    onDragEnd={handleDragEnd}
                                >
                                    <SortableContext
                                        items={routineExercises.map(e => e.exerciseId)}
                                        strategy={verticalListSortingStrategy}
                                    >
                                        <Stack gap="sm">
                                            {routineExercises.map((exercise) => (
                                                <SortableExerciseItem
                                                    key={exercise.exerciseId}
                                                    exercise={exercise}
                                                    exerciseDetails={exercises?.find(e => e.exerciseId === exercise.exerciseId)}
                                                    onRemove={() => removeExercise(exercise.exerciseId)}
                                                    onEdit={() => openEditSuggestions(exercise)}
                                                />
                                            ))}
                                        </Stack>
                                    </SortableContext>
                                </DndContext>
                            ) : (
                                <Text c="dimmed" ta="center" py="xl">{t('routines.noExercisesAdded')}</Text>
                            )}
                        </div>

                        <Group justify="flex-end" mt="md">
                            <Button variant="default" onClick={() => navigate('/routines')}>
                                {t('common.cancel')}
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={!name.trim() || routineExercises.length === 0}
                                loading={createMutation.isPending || updateMutation.isPending}
                            >
                                {isEditMode ? t('routines.update') : t('routines.create')}
                            </Button>
                        </Group>
                    </Stack>
                </Paper>
            </Container>

            {/* Exercise Picker Modal */}
            <Modal
                opened={exercisePickerOpen}
                onClose={() => {
                    setExercisePickerOpen(false);
                    setSearchQuery('');
                    setSelectedBodyParts([]);
                    setSelectedMuscles([]);
                }}
                title={t('routines.selectExercise')}
                size="lg"
            >
                <Stack gap="md">
                    <TextInput
                        placeholder={t('exerciseList.searchPlaceholder')}
                        leftSection={<IconSearch size={16} />}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.currentTarget.value)}
                    />

                    <MultiSelect
                        placeholder={t('exerciseList.filterByBodyPart')}
                        data={allBodyParts}
                        value={selectedBodyParts}
                        onChange={setSelectedBodyParts}
                        searchable
                        clearable
                    />

                    <MultiSelect
                        placeholder={t('exerciseList.filterByMuscle')}
                        data={allMuscles}
                        value={selectedMuscles}
                        onChange={setSelectedMuscles}
                        searchable
                        clearable
                    />

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        <Stack gap="xs">
                            {filteredExercises.map((exercise) => (
                                <Paper
                                    key={exercise.exerciseId}
                                    p="sm"
                                    withBorder
                                    style={{ cursor: 'pointer' }}
                                    onClick={() => addExercise(exercise)}
                                >
                                    <Group wrap="nowrap">
                                        <Avatar src={exercise.gifUrl} radius="sm" size="md" />
                                        <div>
                                            <Text tt="capitalize">{exercise.name}</Text>
                                            <Text size="xs" c="dimmed">{exercise.targetMuscles.join(', ')}</Text>
                                        </div>
                                    </Group>
                                </Paper>
                            ))}
                        </Stack>
                    </div>
                </Stack>
            </Modal>

            {/* Edit Suggestions Modal */}
            <Modal
                opened={!!editingExercise}
                onClose={() => setEditingExercise(null)}
                title={t('routines.editSuggestions')}
            >
                <Stack gap="md">
                    <NumberInput
                        label={t('routines.suggestedSets')}
                        placeholder="e.g., 3"
                        value={suggestedSets}
                        onChange={setSuggestedSets}
                        min={0}
                        allowDecimal={false}
                    />
                    <NumberInput
                        label={t('routines.suggestedReps')}
                        placeholder="e.g., 10"
                        value={suggestedReps}
                        onChange={setSuggestedReps}
                        min={0}
                        allowDecimal={false}
                    />
                    <NumberInput
                        label={t('routines.suggestedWeight')}
                        placeholder="e.g., 60"
                        value={suggestedWeight}
                        onChange={setSuggestedWeight}
                        min={0}
                    />

                    <Group justify="flex-end" mt="md">
                        <Button variant="default" onClick={() => setEditingExercise(null)}>
                            {t('common.cancel')}
                        </Button>
                        <Button onClick={saveSuggestions}>
                            {t('exerciseDetail.save')}
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Box>
    );
}
