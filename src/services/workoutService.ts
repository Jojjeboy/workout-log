import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, where } from 'firebase/firestore';
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
                // Create or update log with the existing ID using setDoc
                const docRef = doc(firestore, 'logs', log.id);
                const logData = { ...log };

                // Remove undefined fields (Firestore doesn't support undefined values)
                Object.keys(logData).forEach(key => {
                    if (logData[key as keyof typeof logData] === undefined) {
                        delete logData[key as keyof typeof logData];
                    }
                });

                await setDoc(docRef, logData);
                return log.id;
            } else {
                // Create new log with auto-generated ID
                const logData = { ...log };

                // Remove undefined fields (Firestore doesn't support undefined values)
                Object.keys(logData).forEach(key => {
                    if (logData[key as keyof typeof logData] === undefined) {
                        delete logData[key as keyof typeof logData];
                    }
                });

                const docRef = await addDoc(collection(firestore, 'logs'), logData);
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
