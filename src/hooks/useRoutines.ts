import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { routineService } from '../services/routineService';
import { WorkoutRoutine } from '../types';
import { useAuth } from './useAuth';
import { notifications } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

/**
 * Hook to fetch all routines for the current user
 */
export function useRoutines() {
    const { user } = useAuth();


    return useQuery({
        queryKey: ['routines', user?.uid],
        queryFn: async () => {
            if (!user) return [];

            try {
                // Try to fetch from Firestore
                if (navigator.onLine) {
                    return await routineService.fetchUserRoutines(user.uid);
                } else {
                    // Fallback to cache when offline
                    return await routineService.getRoutinesFromCache(user.uid);
                }
            } catch (error) {
                // Fallback to cache on error
                return await routineService.getRoutinesFromCache(user.uid);
            }
        },
        enabled: !!user,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
}

/**
 * Hook to get a single routine by ID
 */
export function useRoutine(id: string | undefined) {
    const { data: routines } = useRoutines();

    return {
        data: routines?.find(r => r.id === id),
        isLoading: !routines,
    };
}

/**
 * Hook to create a new routine
 */
export function useCreateRoutine() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (routine: Omit<WorkoutRoutine, 'id' | 'uid' | 'createdAt' | 'updatedAt'>) => {
            if (!user) throw new Error('User not authenticated');
            return await routineService.createRoutine(routine, user.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            notifications.show({
                title: t('routines.created'),
                message: t('routines.createdMessage'),
                color: 'green',
            });
        },
        onError: (error) => {
            console.error('Failed to create routine:', error);
            notifications.show({
                title: t('routines.error'),
                message: t('routines.createError'),
                color: 'red',
            });
        },
    });
}

/**
 * Hook to update an existing routine
 */
export function useUpdateRoutine() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async ({ id, updates }: { id: string; updates: Partial<WorkoutRoutine> }) => {
            await routineService.updateRoutine(id, updates);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            notifications.show({
                title: t('routines.updated'),
                message: t('routines.updatedMessage'),
                color: 'green',
            });
        },
        onError: (error) => {
            console.error('Failed to update routine:', error);
            notifications.show({
                title: t('routines.error'),
                message: t('routines.updateError'),
                color: 'red',
            });
        },
    });
}

/**
 * Hook to delete a routine
 */
export function useDeleteRoutine() {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (id: string) => {
            await routineService.deleteRoutine(id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            notifications.show({
                title: t('routines.deleted'),
                message: t('routines.deletedMessage'),
                color: 'green',
            });
        },
        onError: (error) => {
            console.error('Failed to delete routine:', error);
            notifications.show({
                title: t('routines.error'),
                message: t('routines.deleteError'),
                color: 'red',
            });
        },
    });
}

/**
 * Hook to duplicate a routine
 */
export function useDuplicateRoutine() {
    const queryClient = useQueryClient();
    const { user } = useAuth();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (id: string) => {
            if (!user) throw new Error('User not authenticated');
            return await routineService.duplicateRoutine(id, user.uid);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['routines'] });
            notifications.show({
                title: t('routines.duplicated'),
                message: t('routines.duplicatedMessage'),
                color: 'green',
            });
        },
        onError: (error) => {
            console.error('Failed to duplicate routine:', error);
            notifications.show({
                title: t('routines.error'),
                message: t('routines.duplicateError'),
                color: 'red',
            });
        },
    });
}
