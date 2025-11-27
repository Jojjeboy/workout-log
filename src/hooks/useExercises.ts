import { useQuery } from '@tanstack/react-query';
import { db } from '../services/db';
import { Exercise } from '../types';
import { exerciseLoadService } from '../services/exerciseLoadService';

export function useExercises() {
    return useQuery({
        queryKey: ['exercises'],
        queryFn: exerciseLoadService.loadExercisesWithFallback,
        staleTime: 1000 * 60 * 60, // 1 hour - data doesn't change often
        retry: 2, // Retry failed requests twice
    });
}

export function useExercise(id: string) {
    return useQuery({
        queryKey: ['exercises', id],
        queryFn: async (): Promise<Exercise | undefined> => {
            return await db.exercises.get(id);
        },
        enabled: !!id,
    });
}
