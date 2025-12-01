import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { WorkoutLog } from '../types';

export const workoutService = {
    /**
     * Fetch all workout logs for a specific user from Firebase
     */
    fetchUserLogs: async (uid: string): Promise<WorkoutLog[]> => {
        try {
            const logsRef = collection(firestore, 'logs');
            const q = query(logsRef, where('uid', '==', uid));
            const snapshot = await getDocs(q);

            const logs: WorkoutLog[] = [];
            snapshot.forEach((doc) => {
                logs.push({
                    id: doc.id,
                    ...doc.data()
                } as WorkoutLog);
            });

            return logs;
        } catch (error) {
            console.error('Failed to fetch user logs from Firebase:', error);
            throw error;
        }
    },

    /**
     * Save or update a workout log to Firebase
     */
    syncLogToFirebase: async (log: WorkoutLog): Promise<string> => {
        try {
            if (log.id) {
                // Update existing log
                const docRef = doc(firestore, 'logs', log.id);
                await updateDoc(docRef, { ...log });
                return log.id;
            } else {
                // Create new log
                const docRef = await addDoc(collection(firestore, 'logs'), log);
                return docRef.id;
            }
        } catch (error) {
            console.error('Failed to sync log to Firebase:', error);
            throw error;
        }
    },

    /**
     * Delete a workout log from Firebase
     */
    deleteLogFromFirebase: async (logId: string): Promise<void> => {
        try {
            const docRef = doc(firestore, 'logs', logId);
            await deleteDoc(docRef);
        } catch (error) {
            console.error('Failed to delete log from Firebase:', error);
            throw error;
        }
    }
};
