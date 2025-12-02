import { useState } from 'react';
import { Box, Container, Stack, Title, Group, Button, Progress, Text, Paper, Badge } from '@mantine/core';
import { IconArrowLeft, IconChevronLeft, IconChevronRight, IconCheck } from '@tabler/icons-react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoutine } from '../../hooks/useRoutines';
import { useExercise } from '../../hooks/useExercises';
import { useActiveRoutine } from '../../hooks/useActiveRoutine';
import { useTranslation } from 'react-i18next';
import { WorkoutLogger } from '../workouts/WorkoutLogger';
import { ConfirmDialog } from '../../components/ConfirmDialog';
import { WorkoutSet } from '../../types';

export function ActiveRoutinePage() {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { data: routine, isLoading } = useRoutine(id);
    const [exitConfirmOpen, setExitConfirmOpen] = useState(false);
    const [completionModalOpen, setCompletionModalOpen] = useState(false);
    const [totalLogsCompleted, setTotalLogsCompleted] = useState(0);

    const {
        currentExercise,
        currentExerciseIndex,
        totalExercises,
        progress,
        isLastExercise,
        isFirstExercise,
        nextExercise,
        previousExercise,
        logExercise,
        finishRoutine,
    } = useActiveRoutine(id, routine?.name || '', routine?.exercises || []);

    const { data: exerciseDetails } = useExercise(currentExercise?.exerciseId || '');

    if (isLoading || !routine) {
        return <Text>{t('exerciseDetail.loading')}</Text>;
    }

    const handleLogWorkout = async (sets: WorkoutSet[], date: Date, note?: string) => {
        logExercise(sets, date, note);

        // Auto-advance to next exercise
        if (!isLastExercise) {
            nextExercise();
        }
    };

    const handleFinish = async () => {
        const count = await finishRoutine();
        setTotalLogsCompleted(count);
        setCompletionModalOpen(true);
    };

    const handleExit = () => {
        setExitConfirmOpen(true);
    };

    const confirmExit = () => {
        navigate('/routines');
    };

    return (
        <>
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
                            onClick={handleExit}
                            size="sm"
                            radius="xs"
                            style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: 'white', border: 'none' }}
                        >
                            {t('routines.exit')}
                        </Button>
                    </Group>

                    <Title order={2} style={{ color: 'white' }} mb="xs">{routine.name}</Title>
                    <Text style={{ opacity: 0.8 }} size="sm">
                        {t('routines.exerciseProgress', { current: currentExerciseIndex + 1, total: totalExercises })}
                    </Text>

                    <Progress value={progress} mt="md" size="lg" radius="xl" />
                </div>

                <Container size="lg" px="md" style={{ marginTop: '-40px' }}>
                    <Stack gap="md">
                        {/* Current Exercise Card */}
                        {exerciseDetails && (
                            <Paper p="lg" radius="lg" shadow="sm" bg="white">
                                <Stack gap="md">
                                    <div>
                                        <Group justify="space-between" mb="xs">
                                            <Title order={3} tt="capitalize">{exerciseDetails.name}</Title>
                                            <Badge color="blue">{currentExerciseIndex + 1} / {totalExercises}</Badge>
                                        </Group>
                                        <Text c="dimmed" size="sm">{exerciseDetails.targetMuscles.join(', ')}</Text>
                                    </div>

                                    {/* Suggested Sets/Reps/Weight */}
                                    {(currentExercise?.suggestedSets || currentExercise?.suggestedReps || currentExercise?.suggestedWeight) && (
                                        <Paper p="sm" radius="sm" bg="blue.0">
                                            <Text size="sm" fw={500} mb="xs">{t('routines.suggestions')}:</Text>
                                            <Group gap="sm">
                                                {currentExercise.suggestedSets && (
                                                    <Text size="sm">{currentExercise.suggestedSets} {t('dashboard.sets')}</Text>
                                                )}
                                                {currentExercise.suggestedReps && (
                                                    <Text size="sm">{currentExercise.suggestedReps} {t('dashboard.reps')}</Text>
                                                )}
                                                {currentExercise.suggestedWeight && (
                                                    <Text size="sm">{currentExercise.suggestedWeight} kg</Text>
                                                )}
                                            </Group>
                                        </Paper>
                                    )}

                                    {/* Workout Logger */}
                                    <WorkoutLogger
                                        onSave={handleLogWorkout}
                                        isSaving={false}
                                        onSaveSuccess={() => { }}
                                    />
                                </Stack>
                            </Paper>
                        )}

                        {/* Navigation Buttons */}
                        <Group justify="space-between">
                            <Button
                                leftSection={<IconChevronLeft size={16} />}
                                variant="default"
                                onClick={previousExercise}
                                disabled={isFirstExercise}
                            >
                                {t('routines.previous')}
                            </Button>

                            {isLastExercise ? (
                                <Button
                                    rightSection={<IconCheck size={16} />}
                                    onClick={handleFinish}
                                    color="green"
                                >
                                    {t('routines.finish')}
                                </Button>
                            ) : (
                                <Button
                                    rightSection={<IconChevronRight size={16} />}
                                    onClick={nextExercise}
                                >
                                    {t('routines.next')}
                                </Button>
                            )}
                        </Group>
                    </Stack>
                </Container>
            </Box>

            {/* Exit Confirmation */}
            <ConfirmDialog
                opened={exitConfirmOpen}
                title={t('routines.exitTitle')}
                message={t('routines.exitMessage')}
                confirmLabel={t('routines.exitConfirm')}
                cancelLabel={t('common.cancel')}
                onConfirm={confirmExit}
                onCancel={() => setExitConfirmOpen(false)}
                isDangerous
            />

            {/* Completion Modal */}
            <ConfirmDialog
                opened={completionModalOpen}
                title={t('routines.completedTitle')}
                message={t('routines.completedMessage', { count: totalLogsCompleted })}
                confirmLabel={t('routines.backToRoutines')}
                onConfirm={() => navigate('/routines')}
                onCancel={() => { }}
            />
        </>
    );
}
