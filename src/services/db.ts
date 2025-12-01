import Dexie, { Table } from 'dexie';
import { Exercise, QueueItem } from '../types';

export class IronLogDatabase extends Dexie {
    exercises!: Table<Exercise, string>;

    queue!: Table<QueueItem, number>;

    constructor() {
        super('IronLogDB');
        this.version(1).stores({
            exercises: 'exerciseId, name, *targetMuscles, *bodyParts, *equipments',

            queue: '++id, status, timestamp'
        });
    }
}

export const db = new IronLogDatabase();
