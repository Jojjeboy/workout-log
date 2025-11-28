import { collection, getDocs } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { db } from './db';
import { Exercise } from '../types';

export const exerciseLoadService = {
    /**
     * Loads exercises using a three-tier fallback strategy for optimal performance and reliability:
     * 
     * Priority 1: IndexedDB (browser cache) - Fastest, works offline
     * Priority 2: Firebase Firestore - Cloud database, requires internet
     * Priority 3: Local JSON file - Static fallback data
     * 
     * This approach ensures the app works even when offline and loads quickly after the first visit.
     */
    loadExercisesWithFallback: async (): Promise<Exercise[]> => {
        try {
            // ===== STEP 1: Check local browser cache (IndexedDB) =====
            // This is the fastest option and works offline
            const cachedExercises = await db.exercises.toArray();

            if (cachedExercises.length > 0) {
                console.log(`Loaded ${cachedExercises.length} exercises from browser cache`);
                return cachedExercises;
            }

            // ===== STEP 2: Fetch from Firebase (cloud database) =====
            // Only try this if we're online
            if (navigator.onLine) {
                try {
                    console.log('Cache empty, fetching from Firebase...');

                    // Get all exercises from the 'exercises' collection in Firestore
                    const querySnapshot = await getDocs(collection(firestore, 'exercises'));
                    const firebaseExercises: Exercise[] = [];

                    // Convert Firebase documents to Exercise objects
                    querySnapshot.forEach((doc) => {
                        firebaseExercises.push(doc.data() as Exercise);
                    });

                    if (firebaseExercises.length > 0) {
                        // Save to cache for next time (this makes future loads instant)
                        await db.exercises.bulkPut(firebaseExercises);
                        console.log(`Loaded ${firebaseExercises.length} exercises from Firebase and cached`);
                        return firebaseExercises;
                    }
                } catch (firebaseError) {
                    // If Firebase fails (e.g., network error), log it and continue to Step 3
                    console.warn('Firebase fetch failed, falling back to JSON:', firebaseError);
                }
            }

            // ===== STEP 3: Load from static JSON file (last resort) =====
            // This is our fallback if cache is empty and Firebase fails/unavailable
            console.log('Loading exercises from JSON file...');
            const response = await fetch('/exercises.json');

            if (!response.ok) {
                throw new Error('Failed to fetch exercises.json');
            }

            const jsonExercises: Exercise[] = await response.json();

            // Cache the JSON data so we don't need to fetch it again
            await db.exercises.bulkPut(jsonExercises);
            console.log(`Loaded ${jsonExercises.length} exercises from JSON file and cached`);

            return jsonExercises;
        } catch (error) {
            console.error('Error loading exercises:', error);
            throw error;
        }
    }
};
