import { useMutation } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { WorkoutLog } from '../types';
import { v4 as uuidv4 } from 'uuid';
import { authService } from '../services/authService';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { useAuth } from './useAuth';
import { workoutService } from '../services/workoutService'; // Added back for direct calls

export function useWorkouts() {
    const { user } = useAuth(); // Get user from useAuth hook

    const [logs, setLogs] = useState<WorkoutLog[]>([]); // Local state for logs
    const [isLoadingLogs, setIsLoadingLogs] = useState(true);
    const [errorLoadingLogs, setErrorLoadingLogs] = useState<any>(null);

    useEffect(() => {
        if (!user?.uid) {
            setLogs([]);
            setIsLoadingLogs(false);
            return;
        }

        setIsLoadingLogs(true);
        setErrorLoadingLogs(null);

        const logsCollectionRef = collection(firestore, 'logs');
        const userLogsQuery = query(
            logsCollectionRef,
            where('uid', '==', user.uid),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(userLogsQuery, (snapshot) => {
            const fetchedLogs: WorkoutLog[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data() as WorkoutLog
            }));
            setLogs(fetchedLogs);
            setIsLoadingLogs(false);
        }, (error) => {
            console.error("Failed to fetch real-time logs:", error);
            setErrorLoadingLogs(error);
            setIsLoadingLogs(false);
        });

        return () => unsubscribe(); // Cleanup listener on unmount
    }, [user?.uid]); // Re-run effect if user changes

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

            // Directly call workoutService to save to Firebase
            await workoutService.syncLogToFirebase(newLog);

            return newLog;
        },
        onSuccess: () => {
            // onSnapshot listener will automatically update the UI
        },
    });

    const updateWorkoutMutation = useMutation({
        mutationFn: async (log: WorkoutLog) => {
            const currentUser = authService.getCurrentUser();
            const uid = currentUser?.uid;

            if (!uid) {
                throw new Error('User must be authenticated to update workouts');
            }
            if (log.uid !== uid) {
                throw new Error('User does not have permission to update this workout');
            }

            // Directly call workoutService to update in Firebase
            await workoutService.syncLogToFirebase(log);

            return log;
        },
        onSuccess: () => {
            // onSnapshot listener will automatically update the UI
        },
    });

    const deleteWorkoutMutation = useMutation({
        mutationFn: async (logId: string) => {
            const currentUser = authService.getCurrentUser();
            const uid = currentUser?.uid;

            if (!uid) {
                throw new Error('User must be authenticated to delete workouts');
            }
            // Permission check will happen on server side via Firestore rules

            // Directly call workoutService to delete from Firebase
            await workoutService.deleteLogFromFirebase(logId);

            return logId;
        },
        onSuccess: () => {
            // onSnapshot listener will automatically update the UI
        },
    });

    return {
        logs: logs,
        isLoading: isLoadingLogs,
        error: errorLoadingLogs,
        logWorkout: logWorkoutMutation.mutate,
        isLogging: logWorkoutMutation.isPending,
        updateWorkout: updateWorkoutMutation.mutate,
        isUpdating: updateWorkoutMutation.isPending,
        deleteWorkout: deleteWorkoutMutation.mutate,
        isDeleting: deleteWorkoutMutation.isPending,
    };
}