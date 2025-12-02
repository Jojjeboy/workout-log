import { useState, useCallback } from 'react';
import { ActiveRoutineSession, WorkoutLog, WorkoutSet, RoutineExercise } from '../types';
import { useWorkouts } from './useWorkouts';
import { useAuth } from './useAuth';
import { routineService } from '../services/routineService';

/**
 * Hook to manage an active routine workout session
 * Tracks progress through exercises and accumulates workout logs
 */
export function useActiveRoutine(
    routineId: string | undefined,
    routineName: string,
    exercises: RoutineExercise[]
) {
    const { logWorkout } = useWorkouts();
    const { user } = useAuth();

    const [session, setSession] = useState<ActiveRoutineSession>({
        routineId: routineId || '',
        routineName,
        startedAt: Date.now(),
        currentExerciseIndex: 0,
        completedExercises: [],
        logs: [],
    });

    const nextExercise = useCallback(() => {
        setSession(prev => ({
            ...prev,
            currentExerciseIndex: Math.min(prev.currentExerciseIndex + 1, exercises.length - 1),
        }));
    }, [exercises.length]);

    const previousExercise = useCallback(() => {
        setSession(prev => ({
            ...prev,
            currentExerciseIndex: Math.max(prev.currentExerciseIndex - 1, 0),
        }));
    }, []);

    const logExercise = useCallback((sets: WorkoutSet[], date: Date, note?: string) => {
        const currentExercise = exercises[session.currentExerciseIndex];
        if (!currentExercise || !user) return;

        const log: WorkoutLog = {
            exerciseId: currentExercise.exerciseId,
            timestamp: date.getTime(),
            sets,
            note,
            uid: user.uid,
        };

        setSession(prev => ({
            ...prev,
            logs: [...prev.logs, log],
            completedExercises: [...prev.completedExercises, currentExercise.exerciseId],
        }));
    }, [exercises, session.currentExerciseIndex, user]);

    const isCurrentExerciseCompleted = useCallback(() => {
        const currentExercise = exercises[session.currentExerciseIndex];
        if (!currentExercise) return false;
        return session.completedExercises.includes(currentExercise.exerciseId);
    }, [exercises, session.currentExerciseIndex, session.completedExercises]);

    const finishRoutine = useCallback(async () => {
        for (const log of session.logs) {
            await logWorkout(log);
        }

        if (routineId) {
            await routineService.markRoutineAsUsed(routineId);
        }

        setSession({
            routineId: routineId || '',
            routineName,
            startedAt: Date.now(),
            currentExerciseIndex: 0,
            completedExercises: [],
            logs: [],
        });

        return session.logs.length;
    }, [session.logs, logWorkout, routineId, routineName]);

    const currentExercise = exercises[session.currentExerciseIndex];
    const progress = exercises.length > 0
        ? ((session.currentExerciseIndex + 1) / exercises.length) * 100
        : 0;
    const isLastExercise = session.currentExerciseIndex === exercises.length - 1;
    const isFirstExercise = session.currentExerciseIndex === 0;

    return {
        session,
        currentExercise,
        currentExerciseIndex: session.currentExerciseIndex,
        totalExercises: exercises.length,
        progress,
        isLastExercise,
        isFirstExercise,
        isCurrentExerciseCompleted: isCurrentExerciseCompleted(),
        nextExercise,
        previousExercise,
        logExercise,
        finishRoutine,
    };
}
