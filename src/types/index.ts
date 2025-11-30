export interface Exercise {
    exerciseId: string;
    name: string;
    gifUrl: string;
    targetMuscles: string[];
    bodyParts: string[];
    equipments: string[];
    secondaryMuscles: string[];
    instructions: string[];
}

export interface WorkoutLog {
    id?: string; // Optional for new logs before saving
    exerciseId: string;
    timestamp: number;
    sets: WorkoutSet[];
    note?: string;
}

export interface WorkoutSet {
    weight: number;
    reps: number;
    rpe?: number; // Rate of Perceived Exertion
}

export interface QueueItem {
    id?: number; // Auto-incremented by Dexie
    type: 'LOG_WORKOUT' | 'SYNC_EXERCISES' | 'UPDATE_PROFILE';
    payload: any;
    timestamp: number;
    retryCount: number;
    status: 'pending' | 'processing' | 'failed';
    error?: string;
}

export interface UserProfile {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
}

export interface Note {
    id?: string;
    uid: string;
    title: string;
    content: string;
    createdAt?: any;
    updatedAt?: any;
}
