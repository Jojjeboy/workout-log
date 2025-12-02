import { collection, getDocs, addDoc, setDoc, deleteDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { db } from './db';
import { WorkoutRoutine } from '../types';

export const routineService = {
    /**
     * Create a new workout routine in Firestore and cache locally
     */
    createRoutine: async (routine: Omit<WorkoutRoutine, 'id' | 'uid' | 'createdAt' | 'updatedAt'>, uid: string): Promise<WorkoutRoutine> => {
        try {
            const newRoutine: Omit<WorkoutRoutine, 'id'> = {
                ...routine,
                uid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
            };

            // Remove undefined fields (Firestore doesn't support undefined values)
            Object.keys(newRoutine).forEach(key => {
                if (newRoutine[key as keyof typeof newRoutine] === undefined) {
                    delete newRoutine[key as keyof typeof newRoutine];
                }
            });

            // Save to Firestore
            const docRef = await addDoc(collection(firestore, 'routines'), newRoutine);

            const routineWithId: WorkoutRoutine = {
                ...newRoutine,
                id: docRef.id,
            };

            // Cache locally
            await db.routines.put(routineWithId);

            return routineWithId;
        } catch (error) {
            console.error('Failed to create routine:', error);
            throw error;
        }
    },

    /**
     * Update an existing routine in Firestore and cache
     */
    updateRoutine: async (routineId: string, updates: Partial<WorkoutRoutine>): Promise<void> => {
        try {
            const updatedData = {
                ...updates,
                updatedAt: Date.now(),
            };

            // Update in Firestore
            const docRef = doc(firestore, 'routines', routineId);
            await setDoc(docRef, updatedData, { merge: true });

            // Update in local cache
            const existing = await db.routines.get(routineId);
            if (existing) {
                await db.routines.put({ ...existing, ...updatedData });
            }
        } catch (error) {
            console.error('Failed to update routine:', error);
            throw error;
        }
    },

    /**
     * Delete a routine from Firestore and cache
     */
    deleteRoutine: async (routineId: string): Promise<void> => {
        try {
            // Delete from Firestore
            const docRef = doc(firestore, 'routines', routineId);
            await deleteDoc(docRef);

            // Delete from local cache
            await db.routines.delete(routineId);
        } catch (error) {
            console.error('Failed to delete routine:', error);
            throw error;
        }
    },

    /**
     * Fetch all routines for a specific user from Firestore
     */
    fetchUserRoutines: async (uid: string): Promise<WorkoutRoutine[]> => {
        try {
            const routinesRef = collection(firestore, 'routines');
            const q = query(
                routinesRef,
                where('uid', '==', uid),
                orderBy('updatedAt', 'desc')
            );
            const snapshot = await getDocs(q);

            const routines: WorkoutRoutine[] = [];
            snapshot.forEach((doc) => {
                routines.push({
                    id: doc.id,
                    ...doc.data()
                } as WorkoutRoutine);
            });

            // Cache all fetched routines
            if (routines.length > 0) {
                await db.routines.bulkPut(routines);
            }

            return routines;
        } catch (error) {
            console.error('Failed to fetch user routines:', error);
            throw error;
        }
    },

    /**
     * Get routines from local cache
     */
    getRoutinesFromCache: async (uid: string): Promise<WorkoutRoutine[]> => {
        try {
            const routines = await db.routines
                .where('uid')
                .equals(uid)
                .reverse()
                .sortBy('updatedAt');
            return routines;
        } catch (error) {
            console.error('Failed to get routines from cache:', error);
            return [];
        }
    },

    /**
     * Duplicate a routine (create a copy with new ID)
     */
    duplicateRoutine: async (routineId: string, uid: string): Promise<WorkoutRoutine> => {
        try {
            // Get the original routine
            const original = await db.routines.get(routineId);
            if (!original) {
                throw new Error('Routine not found');
            }

            // Create a copy with modified name and new timestamps
            const duplicate: Omit<WorkoutRoutine, 'id'> = {
                ...original,
                name: `${original.name} (Copy)`,
                uid,
                createdAt: Date.now(),
                updatedAt: Date.now(),
                lastUsed: undefined,
            };

            // Remove the ID to create new
            delete (duplicate as any).id;

            return await routineService.createRoutine(duplicate, uid);
        } catch (error) {
            console.error('Failed to duplicate routine:', error);
            throw error;
        }
    },

    /**
     * Update the lastUsed timestamp when a routine is started
     */
    markRoutineAsUsed: async (routineId: string): Promise<void> => {
        try {
            await routineService.updateRoutine(routineId, {
                lastUsed: Date.now(),
            });
        } catch (error) {
            console.error('Failed to mark routine as used:', error);
            // Non-critical, don't throw
        }
    },
};
