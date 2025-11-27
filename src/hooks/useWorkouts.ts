import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { db } from '../services/db';
import { queueService } from '../services/queueService';
import { WorkoutLog } from '../types';
import { v4 as uuidv4 } from 'uuid';

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
            const newLog: WorkoutLog = {
                ...log,
                id: uuidv4(),
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

    return {
        logs: logsQuery.data,
        isLoading: logsQuery.isLoading,
        logWorkout: logWorkoutMutation.mutate,
        isLogging: logWorkoutMutation.isPending,
    };
}
