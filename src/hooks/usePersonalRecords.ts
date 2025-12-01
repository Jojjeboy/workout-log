import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db as firestore } from '../lib/firebase';
import { PersonalRecord } from '../types';
import { useAuth } from './useAuth';
import { prService } from '../services/prService';
import { useWorkouts } from './useWorkouts';

export function usePersonalRecords(exerciseId?: string) {
    const { user } = useAuth();
    const { logs } = useWorkouts();
    const [prs, setPrs] = useState<PersonalRecord | null>(null);
    const [allPrs, setAllPrs] = useState<PersonalRecord[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    // Load PRs for a specific exercise (if exerciseId is provided)
    useEffect(() => {
        if (!user?.uid || !exerciseId) {
            setPrs(null);
            if (!exerciseId) setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        // First, try to load from IndexedDB for immediate display
        prService.getPRsFromIndexedDB(exerciseId, user.uid)
            .then(localPRs => {
                if (localPRs) {
                    setPrs(localPRs);
                }
            })
            .catch(err => {
                console.error('Failed to load PRs from IndexedDB:', err);
            });

        // Then set up real-time listener for Firebase updates
        const prsRef = collection(firestore, 'personalRecords');
        const prId = `${exerciseId}_${user.uid}`;
        const prQuery = query(prsRef, where('id', '==', prId));

        const unsubscribe = onSnapshot(prQuery, (snapshot) => {
            if (!snapshot.empty) {
                const prData = snapshot.docs[0].data() as PersonalRecord;
                setPrs(prData);
                // Also update IndexedDB
                prService.savePRsToIndexedDB(prData).catch(err => {
                    console.error('Failed to save PRs to IndexedDB:', err);
                });
            } else {
                // No PRs in Firebase, calculate from logs
                if (logs.length > 0) {
                    recalculatePRs();
                }
            }
            setIsLoading(false);
        }, (err) => {
            console.error('Failed to fetch PRs from Firebase:', err);
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, exerciseId]);

    // Load all PRs for the user (used for dashboard, etc.)
    useEffect(() => {
        if (!user?.uid || exerciseId) {
            // Skip if we're loading a specific exercise
            return;
        }

        setIsLoading(true);

        const prsRef = collection(firestore, 'personalRecords');
        const allPrsQuery = query(prsRef, where('uid', '==', user.uid));

        const unsubscribe = onSnapshot(allPrsQuery, (snapshot) => {
            const fetchedPrs: PersonalRecord[] = snapshot.docs.map(doc => doc.data() as PersonalRecord);
            setAllPrs(fetchedPrs);
            setIsLoading(false);
        }, (err) => {
            console.error('Failed to fetch all PRs:', err);
            setError(err);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [user?.uid, exerciseId]);

    // Recalculate PRs from scratch
    const recalculatePRs = async () => {
        if (!user?.uid || !exerciseId || !logs) return;

        try {
            const updatedPRs = await prService.updatePRsForExercise(exerciseId, user.uid, logs);
            setPrs(updatedPRs);
        } catch (err) {
            console.error('Failed to recalculate PRs:', err);
            setError(err);
        }
    };

    // Trigger PR update when logs change
    useEffect(() => {
        if (user?.uid && exerciseId && logs.length > 0) {
            // Debounce PR recalculation to avoid too many updates
            const timeoutId = setTimeout(() => {
                recalculatePRs();
            }, 1000);

            return () => clearTimeout(timeoutId);
        }
    }, [logs.length, user?.uid, exerciseId]);

    return {
        prs: exerciseId ? prs : null,
        allPrs: !exerciseId ? allPrs : [],
        isLoading,
        error,
        recalculatePRs,
    };
}
