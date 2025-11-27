import { useMutation, useQueryClient } from '@tanstack/react-query';
import { exerciseSyncService } from '../services/exerciseSyncService';
import { Exercise } from '../types';

export function useExerciseSync() {
    const queryClient = useQueryClient();

    const syncMutation = useMutation({
        mutationFn: exerciseSyncService.syncFromFirebase,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });

    const uploadMutation = useMutation({
        mutationFn: (exercises: Exercise[]) => exerciseSyncService.uploadExercisesToFirebase(exercises),
    });

    const syncFromJsonMutation = useMutation({
        mutationFn: exerciseSyncService.syncFromJsonFile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['exercises'] });
        },
    });

    return {
        syncExercises: syncMutation.mutate,
        isSyncing: syncMutation.isPending,
        syncError: syncMutation.error,
        uploadExercises: uploadMutation.mutate,
        isUploading: uploadMutation.isPending,
        uploadError: uploadMutation.error,
        syncFromJson: syncFromJsonMutation.mutate,
        isSyncingFromJson: syncFromJsonMutation.isPending,
        syncFromJsonError: syncFromJsonMutation.error,
    };
}
