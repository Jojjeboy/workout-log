import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { db } from '../services/db';
import { queueService } from '../services/queueService';
import { workoutService } from '../services/workoutService';
import { WorkoutLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { authService } from '../services/authService';

export function useWorkouts() {
    const queryClient = useQueryClient();

    const logsQuery = useQuery({
        queryKey: ['logs'],
        queryFn: async () => {
            return await db.logs.orderBy('timestamp').reverse().toArray();
        }
    });

    // Sync logs from Firebase on mount
    useEffect(() => {
        const syncLogsFromFirebase = async () => {
            const currentUser = authService.getCurrentUser();
            if (!currentUser?.uid) return;

            try {
                // Fetch logs from Firebase
                const firebaseLogs = await workoutService.fetchUserLogs(currentUser.uid);

                // Get existing local logs
                const localLogs = await db.logs.toArray();
                const localLogIds = new Set(localLogs.map(log => log.id));

                // Add Firebase logs that aren't in local DB (avoiding duplicates)
                for (const firebaseLog of firebaseLogs) {
                    if (firebaseLog.id && !localLogIds.has(firebaseLog.id)) {
                        await db.logs.add(firebaseLog);
                    }
                }

                // Refresh the query to show merged data
                queryClient.invalidateQueries({ queryKey: ['logs'] });
            } catch (error) {
                console.error('Failed to sync logs from Firebase:', error);
            }
        };

        syncLogsFromFirebase();
    }, [queryClient]);

    const logWorkoutMutation = useMutation({
        mutationFn: async (log: Omit<WorkoutLog, 'id' | 'uid'>) => {
            const currentUser = authService.getCurrentUser();
            const uid = currentUser?.uid;

            if (!uid) {
                throw new Error('User must be authenticated to log workouts');
            }

            const newLog: WorkoutLog = {
                ...log,
                id: uuidv4(),
                uid,
            };

            // Save to local DB
            await db.logs.add(newLog);

            // Queue for sync
            await queueService.enqueue('LOG_WORKOUT', newLog);

            return newLog;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
    });

    const updateWorkoutMutation = useMutation({
        mutationFn: async (log: WorkoutLog) => {
            // Update in local DB
            await db.logs.put(log);

            // Queue for sync
            await queueService.enqueue('LOG_WORKOUT', log);

            return log;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
    });

    const deleteWorkoutMutation = useMutation({
        mutationFn: async (logId: string) => {
            const currentUser = authService.getCurrentUser();
            const uid = currentUser?.uid;

            if (!uid) {
                throw new Error('User must be authenticated to delete workouts');
            }

            // Delete from local DB
            await db.logs.delete(logId);

            // Queue delete for sync
            await queueService.enqueue('DELETE_WORKOUT', { logId, uid });

            return logId;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['logs'] });
        },
    });

    return {
        logs: logsQuery.data,
        isLoading: logsQuery.isLoading,
        logWorkout: logWorkoutMutation.mutate,
        isLogging: logWorkoutMutation.isPending,
        updateWorkout: updateWorkoutMutation.mutate,
        isUpdating: updateWorkoutMutation.isPending,
        deleteWorkout: deleteWorkoutMutation.mutate,
        isDeleting: deleteWorkoutMutation.isPending,
    };
}
