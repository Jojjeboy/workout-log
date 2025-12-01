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
    uid: string; // User ID to associate log with user
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
    type: 'LOG_WORKOUT' | 'SYNC_EXERCISES' | 'UPDATE_PROFILE' | 'DELETE_WORKOUT';
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

export interface PRRecord {
    value: number;
    achievedAt: number; // Timestamp
    workoutLogId: string;
    setIndex: number;
    weight?: number; // For context
    reps?: number; // For context
}

export interface PersonalRecord {
    id?: string; // Document ID in Firestore
    exerciseId: string;
    uid: string;
    maxWeight?: PRRecord;
    maxReps?: PRRecord;
    maxVolume?: PRRecord;
    estimatedOneRepMax?: PRRecord;
    lastUpdated: number;
}
