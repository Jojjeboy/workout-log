import { describe, it, expect, vi, beforeEach } from 'vitest';
import { routineService } from './routineService';
import { db } from './db';

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
const mockOrderBy = vi.fn();

vi.mock('firebase/firestore', () => ({
    collection: (...args: any[]) => mockCollection(...args),
    getDocs: (...args: any[]) => mockGetDocs(...args),
    addDoc: (...args: any[]) => mockAddDoc(...args),
    setDoc: (...args: any[]) => mockSetDoc(...args),
    deleteDoc: (...args: any[]) => mockDeleteDoc(...args),
    doc: (...args: any[]) => mockDoc(...args),
    query: (...args: any[]) => mockQuery(...args),
    where: (...args: any[]) => mockWhere(...args),
    orderBy: (...args: any[]) => mockOrderBy(...args),
}));

// Mock Dexie
vi.mock('./db', () => ({
    db: {
        routines: {
            put: vi.fn(),
            get: vi.fn(),
            delete: vi.fn(),
            bulkPut: vi.fn(),
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    reverse: vi.fn(() => ({
                        sortBy: vi.fn()
                    }))
                }))
            }))
        }
    }
}));

describe('routineService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createRoutine', () => {
        it('should create routine in Firestore and cache', async () => {
            const routineData = { name: 'Test Routine', exercises: [] };
            mockAddDoc.mockResolvedValue({ id: 'newId' });

            const result = await routineService.createRoutine(routineData, 'user1');

            expect(mockAddDoc).toHaveBeenCalled();
            expect(db.routines.put).toHaveBeenCalledWith(expect.objectContaining({
                id: 'newId',
                name: 'Test Routine',
                uid: 'user1'
            }));
            expect(result.id).toBe('newId');
        });
    });

    describe('updateRoutine', () => {
        it('should update routine in Firestore and cache', async () => {
            const updates = { name: 'Updated Name' };
            // Mock existing routine in cache
            (db.routines.get as any).mockResolvedValue({ id: 'r1', name: 'Old Name', uid: 'user1' });

            await routineService.updateRoutine('r1', updates);

            expect(mockSetDoc).toHaveBeenCalled();
            expect(db.routines.put).toHaveBeenCalled();
        });
    });

    describe('deleteRoutine', () => {
        it('should delete from Firestore and cache', async () => {
            await routineService.deleteRoutine('r1');

            expect(mockDeleteDoc).toHaveBeenCalled();
            expect(db.routines.delete).toHaveBeenCalledWith('r1');
        });
    });

    describe('fetchUserRoutines', () => {
        it('should fetch from Firestore and cache results', async () => {
            const mockData = [
                { id: 'r1', data: () => ({ name: 'Routine 1', uid: 'user1' }) }
            ];
            mockGetDocs.mockResolvedValue({
                forEach: (callback: any) => mockData.forEach(callback)
            });

            const routines = await routineService.fetchUserRoutines('user1');

            expect(mockQuery).toHaveBeenCalled();
            expect(db.routines.bulkPut).toHaveBeenCalledWith(expect.arrayContaining([
                expect.objectContaining({ id: 'r1' })
            ]));
            expect(routines).toHaveLength(1);
        });
    });

    describe('duplicateRoutine', () => {
        it('should duplicate routine with new name', async () => {
            const original = { id: 'r1', name: 'Original', exercises: [] };
            (db.routines.get as any).mockResolvedValue(original);
            mockAddDoc.mockResolvedValue({ id: 'newId' });

            const result = await routineService.duplicateRoutine('r1', 'user1');

            expect(result.name).toBe('Original (Copy)');
            expect(result.id).toBe('newId');
            expect(mockAddDoc).toHaveBeenCalled();
        });
    });
});
