# Test Strategy for Workout Log App

## Goal
To achieve high test coverage and ensure system reliability, specifically focusing on:
1.  **Regression Safety**: Catching bugs when refactoring.
2.  **Feature Clarity**: Documenting what works through tests.
3.  **Critical Paths**: Ensuring core functionality (logging workouts, managing routines) is robust.

## Current State
-   **Framework**: Vitest + React Testing Library.
-   **Existing Tests**: `src/services/queueService.test.ts` (Unit test for offline queue).
-   **Coverage**: Very low. Most features are untested.

## Proposed Test Plan

We will adopt a "Testing Pyramid" approach, focusing heavily on **Unit Tests** for logic and **Integration Tests** for critical user flows.

### 1. Service Layer (Unit Tests)
*Logic-heavy services that handle data manipulation and persistence.*

*   **`src/services/workoutService.test.ts`**
    *   `createWorkout`: Verify workout is saved to DB and queue.
    *   `updateWorkout`: Verify edits are persisted.
    *   `deleteWorkout`: Verify soft/hard deletion logic.
    *   `getWorkouts`: Verify filtering and sorting.

*   **`src/services/routineService.test.ts`**
    *   `createRoutine`: Verify routine creation.
    *   `updateRoutine`: Verify adding/removing exercises.
    *   `deleteRoutine`: Verify deletion.

*   **`src/services/prService.test.ts`** (High Value)
    *   `calculatePRs`: Verify logic for finding 1RM, max volume, etc.
    *   `checkNewPR`: Verify detection of new records.

### 2. Feature Components (Integration Tests)
*Testing the UI and user interactions. We will mock the underlying services to focus on the Component Logic.*

*   **`src/features/workouts/WorkoutLogger.test.tsx`**
    *   **Render**: Check if form fields render (Sets, Reps, Weight).
    *   **Interaction**: Simulate user typing and clicking "Save".
    *   **Validation**: Check if invalid inputs show errors.
    *   **Success**: Verify `workoutService.save` is called with correct data.

*   **`src/features/routines/RoutineDetail.test.tsx`**
    *   **Render**: Check if exercises in routine are listed.
    *   **Interaction**: Test "Start Workout" button.

*   **`src/features/exercises/ExerciseDetail.test.tsx`**
    *   **Render**: Check if charts and history render.

### 3. Hooks (Unit/Integration Tests)
*Custom hooks often contain complex state logic.*

*   **`src/hooks/useWorkouts.test.ts`**
    *   Verify data fetching and mutation states.

## Implementation Priority

1.  **`prService.test.ts`**: Pure logic, easy to test, high value (users care about PRs).
2.  **`workoutService.test.ts`**: Core data integrity.
3.  **`WorkoutLogger.test.tsx`**: Critical user flow (Logging).

## Reasoning
-   **Why Services first?** They are the foundation. If `workoutService` fails, the UI will fail. They are also faster to write and run than component tests.
-   **Why PR Service?** It involves calculation logic which is prone to regression bugs during refactoring.
-   **Why WorkoutLogger?** It's the most used feature. Breaking it is critical.
