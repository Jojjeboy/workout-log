import Dexie, { Table } from 'dexie';
import { Exercise, QueueItem, PersonalRecord, WorkoutRoutine } from '../types';

export class IronLogDatabase extends Dexie {
    exercises!: Table<Exercise, string>;

    queue!: Table<QueueItem, number>;

    personalRecords!: Table<PersonalRecord, string>;

    routines!: Table<WorkoutRoutine, string>;

    constructor() {
        super('IronLogDB');
        this.version(1).stores({
            exercises: 'exerciseId, name, *targetMuscles, *bodyParts, *equipments',

            queue: '++id, status, timestamp'
        });

        // Version 2: Add personalRecords table
        this.version(2).stores({
            exercises: 'exerciseId, name, *targetMuscles, *bodyParts, *equipments',
            queue: '++id, status, timestamp',
            personalRecords: 'id, [exerciseId+uid], uid, lastUpdated'
        });

        // Version 3: Add routines table
        this.version(3).stores({
            exercises: 'exerciseId, name, *targetMuscles, *bodyParts, *equipments',
            queue: '++id, status, timestamp',
            personalRecords: 'id, [exerciseId+uid], uid, lastUpdated',
            routines: 'id, uid, name, createdAt, lastUsed'
        });
    }
}

export const db = new IronLogDatabase();
