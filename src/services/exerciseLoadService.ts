import { collection, getDocs } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { db } from './db';
import { Exercise } from '../types';

export const exerciseLoadService = {
    /**
     * Load exercises with fallback chain:
     * 1. Check IndexedDB cache first (fastest, offline-capable)
     * 2. Try Firebase if cache is empty
     * 3. Fallback to JSON file if offline or Firebase fails
     */
    loadExercisesWithFallback: async (): Promise<Exercise[]> => {
        try {
            // Step 1: Check IndexedDB cache first
            const cachedExercises = await db.exercises.toArray();
            if (cachedExercises.length > 0) {
                console.log(`Loaded ${cachedExercises.length} exercises from browser cache`);
                return cachedExercises;
            }

            // Step 2: Try fetching from Firebase
            if (navigator.onLine) {
                try {
                    console.log('Cache empty, fetching from Firebase...');
                    const querySnapshot = await getDocs(collection(firestore, 'exercises'));
                    const firebaseExercises: Exercise[] = [];

                    querySnapshot.forEach((doc) => {
                        firebaseExercises.push(doc.data() as Exercise);
                    });

                    if (firebaseExercises.length > 0) {
                        // Cache the data for future offline use
                        await db.exercises.bulkPut(firebaseExercises);
                        console.log(`Loaded ${firebaseExercises.length} exercises from Firebase and cached`);
                        return firebaseExercises;
                    }
                } catch (firebaseError) {
                    console.warn('Firebase fetch failed, falling back to JSON:', firebaseError);
                }
            }

            // Step 3: Fallback to JSON file (offline or Firebase empty/failed)
            console.log('Loading exercises from JSON file...');
            const response = await fetch('/exercises.json');
            if (!response.ok) {
                throw new Error('Failed to fetch exercises.json');
            }

            const jsonExercises: Exercise[] = await response.json();

            // Cache the JSON data for future use
            await db.exercises.bulkPut(jsonExercises);
            console.log(`Loaded ${jsonExercises.length} exercises from JSON file and cached`);

            return jsonExercises;
        } catch (error) {
            console.error('Error loading exercises:', error);
            throw error;
        }
    }
};
