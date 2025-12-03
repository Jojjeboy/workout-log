import { describe, it, expect } from 'vitest';
import { prService } from './prService';
import { WorkoutLog } from '../types';

describe('prService', () => {
    describe('calculatePRsForExercise', () => {
        it('should correctly calculate max weight, reps, volume and 1RM', () => {
            const logs: WorkoutLog[] = [
                {
                    id: 'log1',
                    exerciseId: 'ex1',
                    uid: 'user1',
                    timestamp: 1000,
                    date: '2023-01-01',
                    sets: [
                        { weight: 100, reps: 5 }, // Vol: 500, 1RM: 116.6
                        { weight: 110, reps: 3 }, // Vol: 330, 1RM: 121
                    ]
                },
                {
                    id: 'log2',
                    exerciseId: 'ex1',
                    uid: 'user1',
                    timestamp: 2000,
                    date: '2023-01-02',
                    sets: [
                        { weight: 90, reps: 10 }, // Vol: 900, 1RM: 120
                    ]
                }
            ];

            const prs = prService.calculatePRsForExercise('ex1', 'user1', logs);

            // Max Weight: 110 (from log1)
            expect(prs.maxWeight?.value).toBe(110);
            expect(prs.maxWeight?.workoutLogId).toBe('log1');

            // Max Reps: 10 (from log2)
            expect(prs.maxReps?.value).toBe(10);
            expect(prs.maxReps?.workoutLogId).toBe('log2');

            // Max Volume: 900 (90 * 10 from log2)
            expect(prs.maxVolume?.value).toBe(900);
            expect(prs.maxVolume?.workoutLogId).toBe('log2');

            // Estimated 1RM: 121 (110 * (1 + 3/30) from log1)
            expect(prs.estimatedOneRepMax?.value).toBeCloseTo(121);
            expect(prs.estimatedOneRepMax?.workoutLogId).toBe('log1');
        });

        it('should handle empty logs', () => {
            const prs = prService.calculatePRsForExercise('ex1', 'user1', []);
            expect(prs.maxWeight).toBeUndefined();
            expect(prs.maxReps).toBeUndefined();
            expect(prs.maxVolume).toBeUndefined();
            expect(prs.estimatedOneRepMax).toBeUndefined();
        });

        it('should filter logs by exerciseId and uid', () => {
            const logs: WorkoutLog[] = [
                {
                    id: 'log1',
                    exerciseId: 'ex1',
                    uid: 'user1',
                    timestamp: 1000,
                    date: '2023-01-01',
                    sets: [{ weight: 100, reps: 5, completed: true }]
                },
                {
                    id: 'log2',
                    exerciseId: 'ex2', // Different exercise
                    uid: 'user1',
                    timestamp: 2000,
                    date: '2023-01-02',
                    sets: [{ weight: 200, reps: 5, completed: true }]
                },
                {
                    id: 'log3',
                    exerciseId: 'ex1',
                    uid: 'user2', // Different user
                    timestamp: 3000,
                    date: '2023-01-03',
                    sets: [{ weight: 300, reps: 5, completed: true }]
                }
            ];

            const prs = prService.calculatePRsForExercise('ex1', 'user1', logs);
            expect(prs.maxWeight?.value).toBe(100);
        });
    });

    describe('detectNewPRs', () => {
        it('should detect new max weight PR', () => {
            const currentPRs: any = {
                maxWeight: { value: 100 }
            };
            const newLog: WorkoutLog = {
                id: 'new',
                exerciseId: 'ex1',
                uid: 'user1',
                timestamp: 3000,
                date: '2023-01-03',
                sets: [{ weight: 105, reps: 1, completed: true }]
            };

            const newRecords = prService.detectNewPRs(newLog, currentPRs);
            expect(newRecords).toContain('maxWeight');
        });

        it('should not detect PR if value is lower or equal', () => {
            const currentPRs: any = {
                maxWeight: { value: 100 }
            };
            const newLog: WorkoutLog = {
                id: 'new',
                exerciseId: 'ex1',
                uid: 'user1',
                timestamp: 3000,
                date: '2023-01-03',
                sets: [{ weight: 100, reps: 1, completed: true }]
            };

            const newRecords = prService.detectNewPRs(newLog, currentPRs);
            expect(newRecords).toHaveLength(0);
        });

        it('should return empty array if no current PRs exist (technically everything is new but function logic returns empty)', () => {
            const newLog: WorkoutLog = {
                id: 'new',
                exerciseId: 'ex1',
                uid: 'user1',
                timestamp: 3000,
                date: '2023-01-03',
                sets: [{ weight: 100, reps: 1, completed: true }]
            };
            // The function implementation returns [] if !currentPRs
            const newRecords = prService.detectNewPRs(newLog, undefined);
            expect(newRecords).toEqual([]);
        });
    });
});
