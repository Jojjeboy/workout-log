import { describe, it, expect, vi, beforeEach } from 'vitest';
import { workoutService } from './workoutService';
import { WorkoutLog } from '../types';

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    db: {},
}));

const mockGetDocs = vi.fn();
const mockAddDoc = vi.fn();
const mockSetDoc = vi.fn();
const mockDeleteDoc = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();
const mockQuery = vi.fn();
const mockWhere = vi.fn();

vi.mock('firebase/firestore', () => ({
    collection: (...args: any[]) => mockCollection(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    addDoc: (...args: any[]) => mockAddDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
    doc: (...args: any[]) => mockDoc(...args),
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
}));

describe('workoutService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('fetchUserLogs', () => {
        it('should fetch and map logs correctly', async () => {
            const mockData = [
                { id: 'log1', data: () => ({ exerciseId: 'ex1', uid: 'user1' }) },
                { id: 'log2', data: () => ({ exerciseId: 'ex2', uid: 'user1' }) },
            ];
            mockGetDocs.mockResolvedValue({
                forEach: (callback: any) => mockData.forEach(callback)
            });

            const logs = await workoutService.fetchUserLogs('user1');

            expect(mockCollection).toHaveBeenCalled();
            expect(mockQuery).toHaveBeenCalled();
            expect(mockWhere).toHaveBeenCalledWith('uid', '==', 'user1');
            expect(logs).toHaveLength(2);
            expect(logs[0].id).toBe('log1');
            expect(logs[1].exerciseId).toBe('ex2');
        });

        it('should handle errors', async () => {
            mockGetDocs.mockRejectedValue(new Error('Fetch failed'));
            await expect(workoutService.fetchUserLogs('user1')).rejects.toThrow('Fetch failed');
        });
    });

    describe('syncLogToFirebase', () => {
        it('should create a new log if id is missing', async () => {
            const newLog: WorkoutLog = {
                exerciseId: 'ex1',
                uid: 'user1',
                timestamp: 123,
                date: '2023-01-01',
                sets: []
            };
            mockAddDoc.mockResolvedValue({ id: 'newId' });

            const id = await workoutService.syncLogToFirebase(newLog);

            expect(mockAddDoc).toHaveBeenCalled();
            expect(id).toBe('newId');
        });

        it('should update existing log if id is present', async () => {
            const existingLog: WorkoutLog = {
                id: 'log1',
                exerciseId: 'ex1',
                uid: 'user1',
                timestamp: 123,
                date: '2023-01-01',
                sets: []
            };

            const id = await workoutService.syncLogToFirebase(existingLog);

            expect(mockSetDoc).toHaveBeenCalled();
            expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'logs', 'log1');
            expect(id).toBe('log1');
        });

        it('should remove undefined fields before saving', async () => {
            const logWithUndefined: any = {
                exerciseId: 'ex1',
                uid: 'user1',
                undefinedField: undefined
            };
            mockAddDoc.mockResolvedValue({ id: 'newId' });

            await workoutService.syncLogToFirebase(logWithUndefined);

            const calledArg = mockAddDoc.mock.calls[0][1];
            expect(calledArg).not.toHaveProperty('undefinedField');
            expect(calledArg).toHaveProperty('exerciseId');
        });
    });

    describe('deleteLogFromFirebase', () => {
        it('should delete log', async () => {
            await workoutService.deleteLogFromFirebase('log1');
            expect(mockDeleteDoc).toHaveBeenCalled();
            expect(mockDoc).toHaveBeenCalledWith(expect.anything(), 'logs', 'log1');
        });
    });
});
