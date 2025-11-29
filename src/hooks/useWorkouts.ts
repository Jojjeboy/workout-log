import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../services/db';
import { queueService } from '../services/queueService';
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

    const logWorkoutMutation = useMutation({
        mutationFn: async (log: Omit<WorkoutLog, 'id'>) => {
            const currentUser = authService.getCurrentUser();
            const uid = currentUser?.uid;

            const newLog: WorkoutLog = {
                ...log,
                id: uuidv4(),
                ...(uid ? { uid } : {} as any),
            } as any;

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
            // Delete from local DB
            await db.logs.delete(logId);

            // TODO: Queue delete for sync
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
