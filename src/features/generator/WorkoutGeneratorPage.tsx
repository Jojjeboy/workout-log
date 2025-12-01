import { useState, useMemo } from 'react';
import { Container, Title, Text, SegmentedControl, Select, Button, Stack, Paper, Box } from '@mantine/core';
import { IconWand, IconRefresh } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { useExercises } from '../../hooks/useExercises';
import { ExerciseItem } from '../../components/ExerciseItem';
import { useGeneratedExercises } from '../../contexts/GeneratedExercisesContext';

export function WorkoutGeneratorPage() {
    const { t } = useTranslation();
    const { data: exercises } = useExercises();

    const [numExercises, setNumExercises] = useState('3');
    const [muscleGroup, setMuscleGroup] = useState<string | null>('random');
    const [equipment, setEquipment] = useState<string | null>('any');
    const { generatedExercises, setGeneratedExercises } = useGeneratedExercises();

    const { allMuscles, allEquipment } = useMemo(() => {
        if (!exercises) return { allMuscles: [], allEquipment: [] };

        const muscleSet = new Set<string>();
        const equipmentSet = new Set<string>();

        exercises.forEach(exercise => {
            exercise.targetMuscles.forEach(muscle => muscleSet.add(muscle));
            exercise.bodyParts.forEach(bodyPart => muscleSet.add(bodyPart));
            exercise.equipments.forEach(eq => equipmentSet.add(eq));
        });

        return {
            allMuscles: ['random', ...Array.from(muscleSet).sort()],
            allEquipment: ['any', ...Array.from(equipmentSet).sort()]
        };
    }, [exercises]);

    const handleGenerate = () => {
        if (!exercises) return;

        let filtered = exercises;

        // Filter by muscle group
        if (muscleGroup && muscleGroup !== 'random') {
            filtered = filtered.filter(ex =>
                ex.targetMuscles.includes(muscleGroup) ||
                ex.bodyParts.includes(muscleGroup)
            );
        }

        // Filter by equipment
        if (equipment && equipment !== 'any') {
            filtered = filtered.filter(ex =>
                ex.equipments.includes(equipment)
            );
        }

        const shuffled = [...filtered].sort(() => Math.random() - 0.5);
        setGeneratedExercises(shuffled.slice(0, parseInt(numExercises)));
    };

    const muscleOptions = allMuscles.map(m => ({
        value: m,
        label: m === 'random' ? t('generator.random') : m.charAt(0).toUpperCase() + m.slice(1)
    }));

    const equipmentOptions = allEquipment.map(e => ({
        value: e,
        label: e === 'any' ? t('generator.anyEquipment') : e.charAt(0).toUpperCase() + e.slice(1)
    }));

    return (
        <Box bg="#f8f9fa" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
            {/* Header */}
            <div style={{
                background: 'linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)',
                padding: '20px 20px 60px',
                color: 'white',
                borderBottomLeftRadius: '10px',
                borderBottomRightRadius: '10px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
                <Title order={2} style={{ color: 'white' }}>{t('generator.title')}</Title>
                <Text size="xs" style={{ opacity: 0.8 }}>{t('generator.subtitle')}</Text>
            </div>

            <Container size="lg" px="md" style={{ marginTop: '-40px' }}>
                <Stack gap="lg">
                    {/* Controls */}
                    <Paper radius="lg" p="md" shadow="sm" bg="white">
                        <Stack gap="md">
                            <div>
                                <Text size="sm" fw={500} mb={5}>{t('generator.numExercises')}</Text>
                                <SegmentedControl
                                    value={numExercises}
                                    onChange={setNumExercises}
                                    data={[
                                        { label: '3', value: '3' },
                                        { label: '5', value: '5' },
                                        { label: '7', value: '7' },
                                    ]}
                                    fullWidth
                                />
                            </div>

                            <div>
                                <Text size="sm" fw={500} mb={5}>{t('generator.muscleGroup')}</Text>
                                <Select
                                    data={muscleOptions}
                                    value={muscleGroup}
                                    onChange={setMuscleGroup}
                                    allowDeselect={false}
                                />
                            </div>

                            <div>
                                <Text size="sm" fw={500} mb={5}>{t('generator.equipment')}</Text>
                                <Select
                                    data={equipmentOptions}
                                    value={equipment}
                                    onChange={setEquipment}
                                    allowDeselect={false}
                                />
                            </div>

                            <Button
                                leftSection={generatedExercises.length > 0 ? <IconRefresh size={20} /> : <IconWand size={20} />}
                                onClick={handleGenerate}
                                fullWidth
                                size="md"
                            >
                                {generatedExercises.length > 0 ? t('generator.regenerate') : t('generator.generate')}
                            </Button>
                        </Stack>
                    </Paper>

                    {/* Results */}
                    {generatedExercises.length > 0 && (
                        <Paper radius="lg" withBorder shadow="sm" style={{ overflow: 'hidden', background: 'white' }}>
                            {generatedExercises.map((exercise, index) => (
                                <ExerciseItem
                                    key={exercise.exerciseId}
                                    exercise={exercise}
                                    hasDivider={index < generatedExercises.length - 1}
                                />
                            ))}
                        </Paper>
                    )}
                </Stack>
            </Container>
        </Box>
    );
}
