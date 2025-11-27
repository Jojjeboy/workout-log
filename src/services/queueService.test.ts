import { describe, it, expect, vi, beforeEach } from 'vitest';
import { queueService } from './queueService';
import { db } from './db';

// Mock Dexie
vi.mock('./db', () => ({
    db: {
        queue: {
            add: vi.fn(),
            where: vi.fn(() => ({
                equals: vi.fn(() => ({
                    sortBy: vi.fn(() => Promise.resolve([]))
                }))
            })),
            delete: vi.fn(),
            update: vi.fn(),
        }
    }
}));

// Mock Firebase
vi.mock('../lib/firebase', () => ({
    db: {},
    auth: {},
}));

describe('queueService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should enqueue an item', async () => {
        const payload = { exerciseId: '123', sets: [] };
        await queueService.enqueue('LOG_WORKOUT', payload);

        expect(db.queue.add).toHaveBeenCalledWith(expect.objectContaining({
            type: 'LOG_WORKOUT',
            payload,
            status: 'pending'
        }));
    });
});
