import { collection, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { db } from './db';
import { Exercise } from '../types';

export const exerciseSyncService = {
    syncFromFirebase: async (): Promise<void> => {
        try {
            if (!navigator.onLine) {
                console.log('Offline: Skipping sync from Firebase');
                return;
            }

            const querySnapshot = await getDocs(collection(firestore, 'exercises'));
            const exercises: Exercise[] = [];

            querySnapshot.forEach((doc) => {
                exercises.push(doc.data() as Exercise);
            });

            if (exercises.length > 0) {
                await db.exercises.bulkPut(exercises);
                console.log(`Synced ${exercises.length} exercises from Firebase`);
            }
        } catch (error) {
            console.error('Error syncing exercises from Firebase:', error);
            throw error;
        }
    },

    uploadExercisesToFirebase: async (exercises: Exercise[]): Promise<void> => {
        // Batch writes in Firestore (limit 500 per batch)
        const batchSize = 450;
        const chunks = [];

        for (let i = 0; i < exercises.length; i += batchSize) {
            chunks.push(exercises.slice(i, i + batchSize));
        }

        for (const chunk of chunks) {
            const batch = writeBatch(firestore);
            chunk.forEach((exercise) => {
                const ref = doc(firestore, 'exercises', exercise.exerciseId);
                batch.set(ref, exercise);
            });
            await batch.commit();
        }

        console.log('Uploaded exercises to Firebase');
    },

    syncFromJsonFile: async (): Promise<void> => {
        try {
            // Fetch the exercises.json file from the public folder
            const response = await fetch('/exercises.json');
            if (!response.ok) {
                throw new Error('Failed to fetch exercises.json');
            }

            const exercises: Exercise[] = await response.json();
            console.log(`Loaded ${exercises.length} exercises from JSON file`);

            // Upload to Firestore in batches
            // Note: batch.set() overwrites existing documents with the same ID,
            // preventing duplicates without needing to delete first
            const batchSize = 450;
            const chunks = [];

            for (let i = 0; i < exercises.length; i += batchSize) {
                chunks.push(exercises.slice(i, i + batchSize));
            }

            for (const chunk of chunks) {
                const batch = writeBatch(firestore);
                chunk.forEach((exercise) => {
                    const ref = doc(firestore, 'exercises', exercise.exerciseId);
                    batch.set(ref, exercise); // Overwrites if exists, creates if not
                });
                await batch.commit();
            }

            console.log(`Uploaded ${exercises.length} exercises to Firestore (overwrote any existing)`);

            // Cache in IndexedDB (browser cache)
            await db.exercises.bulkPut(exercises);
            console.log(`Cached ${exercises.length} exercises in IndexedDB`);
        } catch (error) {
            console.error('Error syncing from JSON file:', error);
            throw error;
        }
    }
};
