import { collection, doc, setDoc, getDoc, query, where, getDocs } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { db } from './db';
import { PersonalRecord, PRRecord, WorkoutLog, WorkoutSet } from '../types';

/**
 * Calculate estimated one-rep max using the Epley formula
 * 1RM = weight × (1 + reps/30)
 */
function calculateOneRepMax(weight: number, reps: number): number {
    if (reps === 1) return weight;
    return weight * (1 + reps / 30);
}

/**
 * Calculate volume for a set (weight × reps)
 */
function calculateVolume(weight: number, reps: number): number {
    return weight * reps;
}

/**
 * Analyze all workout logs for an exercise and calculate PRs
 */
export function calculatePRsForExercise(
    exerciseId: string,
    uid: string,
    logs: WorkoutLog[]
): Omit<PersonalRecord, 'id'> {
    const exerciseLogs = logs.filter(log => log.exerciseId === exerciseId && log.uid === uid);

    let maxWeight: PRRecord | undefined;
    let maxReps: PRRecord | undefined;
    let maxVolume: PRRecord | undefined;
    let estimatedOneRepMax: PRRecord | undefined;

    exerciseLogs.forEach(log => {
        log.sets?.forEach((set: WorkoutSet, setIndex: number) => {
            const { weight, reps } = set;

            // Max Weight
            if (!maxWeight || weight > maxWeight.value) {
                maxWeight = {
                    value: weight,
                    achievedAt: log.timestamp,
                    workoutLogId: log.id!,
                    setIndex,
                    weight,
                    reps,
                };
            }

            // Max Reps
            if (!maxReps || reps > maxReps.value) {
                maxReps = {
                    value: reps,
                    achievedAt: log.timestamp,
                    workoutLogId: log.id!,
                    setIndex,
                    weight,
                    reps,
                };
            }

            // Max Volume
            const volume = calculateVolume(weight, reps);
            if (!maxVolume || volume > maxVolume.value) {
                maxVolume = {
                    value: volume,
                    achievedAt: log.timestamp,
                    workoutLogId: log.id!,
                    setIndex,
                    weight,
                    reps,
                };
            }

            // Estimated 1RM
            const oneRepMax = calculateOneRepMax(weight, reps);
            if (!estimatedOneRepMax || oneRepMax > estimatedOneRepMax.value) {
                estimatedOneRepMax = {
                    value: oneRepMax,
                    achievedAt: log.timestamp,
                    workoutLogId: log.id!,
                    setIndex,
                    weight,
                    reps,
                };
            }
        });
    });

    return {
        exerciseId,
        uid,
        maxWeight,
        maxReps,
        maxVolume,
        estimatedOneRepMax,
        lastUpdated: Date.now(),
    };
}

/**
 * Save PRs to IndexedDB
 */
export async function savePRsToIndexedDB(prs: PersonalRecord): Promise<void> {
    const id = `${prs.exerciseId}_${prs.uid}`;
    await db.personalRecords.put({ ...prs, id });
}

/**
 * Get PRs from IndexedDB
 */
export async function getPRsFromIndexedDB(
    exerciseId: string,
    uid: string
): Promise<PersonalRecord | undefined> {
    const id = `${exerciseId}_${uid}`;
    return await db.personalRecords.get(id);
}

/**
 * Sync PRs to Firebase
 */
export async function syncPRsToFirebase(prs: PersonalRecord): Promise<void> {
    const id = `${prs.exerciseId}_${prs.uid}`;
    const docRef = doc(firestore, 'personalRecords', id);
    await setDoc(docRef, {
        ...prs,
        id,
    });
}

/**
 * Get PRs from Firebase
 */
export async function getPRsFromFirebase(
    exerciseId: string,
    uid: string
): Promise<PersonalRecord | null> {
    const id = `${exerciseId}_${uid}`;
    const docRef = doc(firestore, 'personalRecords', id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
        return docSnap.data() as PersonalRecord;
    }
    return null;
}

/**
 * Get all PRs for a user from Firebase
 */
export async function getAllPRsFromFirebase(uid: string): Promise<PersonalRecord[]> {
    const prsRef = collection(firestore, 'personalRecords');
    const q = query(prsRef, where('uid', '==', uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => doc.data() as PersonalRecord);
}

/**
 * Update PRs for an exercise based on all logs
 * This recalculates from scratch and syncs to both IndexedDB and Firebase
 */
export async function updatePRsForExercise(
    exerciseId: string,
    uid: string,
    logs: WorkoutLog[]
): Promise<PersonalRecord> {
    const prs = calculatePRsForExercise(exerciseId, uid, logs);
    const prsWithId: PersonalRecord = {
        ...prs,
        id: `${exerciseId}_${uid}`,
    };

    // Save to IndexedDB
    await savePRsToIndexedDB(prsWithId);

    // Sync to Firebase
    try {
        await syncPRsToFirebase(prsWithId);
    } catch (error) {
        console.error('Failed to sync PRs to Firebase:', error);
        // Don't throw - we want local PRs to work even if Firebase fails
    }

    return prsWithId;
}

/**
 * Check if a new workout log contains any PRs
 * Returns an array of PR types that were broken
 */
export function detectNewPRs(
    newLog: WorkoutLog,
    currentPRs?: PersonalRecord
): ('maxWeight' | 'maxReps' | 'maxVolume' | 'estimatedOneRepMax')[] {
    if (!currentPRs) return []; // Can't break a PR if there are no existing PRs

    const newPRs: ('maxWeight' | 'maxReps' | 'maxVolume' | 'estimatedOneRepMax')[] = [];

    newLog.sets?.forEach((set: WorkoutSet) => {
        const { weight, reps } = set;

        // Check Max Weight
        if (currentPRs.maxWeight && weight > currentPRs.maxWeight.value) {
            if (!newPRs.includes('maxWeight')) newPRs.push('maxWeight');
        }

        // Check Max Reps
        if (currentPRs.maxReps && reps > currentPRs.maxReps.value) {
            if (!newPRs.includes('maxReps')) newPRs.push('maxReps');
        }

        // Check Max Volume
        const volume = calculateVolume(weight, reps);
        if (currentPRs.maxVolume && volume > currentPRs.maxVolume.value) {
            if (!newPRs.includes('maxVolume')) newPRs.push('maxVolume');
        }

        // Check Estimated 1RM
        const oneRepMax = calculateOneRepMax(weight, reps);
        if (currentPRs.estimatedOneRepMax && oneRepMax > currentPRs.estimatedOneRepMax.value) {
            if (!newPRs.includes('estimatedOneRepMax')) newPRs.push('estimatedOneRepMax');
        }
    });

    return newPRs;
}

export const prService = {
    calculatePRsForExercise,
    savePRsToIndexedDB,
    getPRsFromIndexedDB,
    syncPRsToFirebase,
    getPRsFromFirebase,
    getAllPRsFromFirebase,
    updatePRsForExercise,
    detectNewPRs,
};
