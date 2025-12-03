import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WorkoutLogger } from './WorkoutLogger';
import { MantineProvider } from '@mantine/core';

// Mock dependencies
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@mantine/notifications', () => ({
    showNotification: vi.fn(),
}));

// Wrap component in MantineProvider
const renderWithMantine = (component: React.ReactNode) => {
    return render(
        <MantineProvider>
            {component}
        </MantineProvider>
    );
};

describe('WorkoutLogger', () => {
    it('should render initial state correctly', () => {
        renderWithMantine(
            <WorkoutLogger
                onSave={vi.fn()}
                isSaving={false}
            />
        );

        expect(screen.getByText('workoutLogger.workoutDate')).toBeInTheDocument();
        expect(screen.getByText('dashboard.weight')).toBeInTheDocument();
        expect(screen.getByText('dashboard.reps')).toBeInTheDocument();
        // Should have one row initially
        expect(screen.getAllByRole('row')).toHaveLength(2); // Header + 1 data row
    });

    it('should add a new set when "Add Set" is clicked', () => {
        renderWithMantine(
            <WorkoutLogger
                onSave={vi.fn()}
                isSaving={false}
            />
        );

        const addButton = screen.getByText('workoutLogger.addSet');
        fireEvent.click(addButton);

        // Header + 2 data rows
        expect(screen.getAllByRole('row')).toHaveLength(3);
    });

    it('should call onSave with correct data when valid', () => {
        const onSave = vi.fn();
        renderWithMantine(
            <WorkoutLogger
                onSave={onSave}
                isSaving={false}
            />
        );

        // Fill in inputs
        // Note: Mantine NumberInput might be tricky to select by role, using placeholder or other attributes
        // Assuming the inputs are found (this might need adjustment based on actual DOM)
        const inputs = screen.getAllByRole('textbox');
        // Date input is first, then weight, then reps (Mantine NumberInput renders an input type=text/number)

        // We need to target the specific inputs. 
        // Since Mantine NumberInput hides controls and uses custom structure, we might need to rely on the fact they are inputs inside the table cells.
        // Let's try to find them by placeholder "0"
        const numberInputs = screen.getAllByPlaceholderText('0');

        fireEvent.change(numberInputs[0], { target: { value: '100' } }); // Weight
        fireEvent.change(numberInputs[1], { target: { value: '5' } });   // Reps

        const saveButton = screen.getByText('workoutLogger.logWorkout');
        fireEvent.click(saveButton);

        expect(onSave).toHaveBeenCalledWith(
            expect.arrayContaining([
                expect.objectContaining({ weight: 100, reps: 5 })
            ]),
            expect.any(Date)
        );
    });

    it('should not call onSave if inputs are invalid', () => {
        const onSave = vi.fn();
        renderWithMantine(
            <WorkoutLogger
                onSave={onSave}
                isSaving={false}
            />
        );

        // Leave inputs empty
        const saveButton = screen.getByText('workoutLogger.logWorkout');
        fireEvent.click(saveButton);

        expect(onSave).not.toHaveBeenCalled();
    });
});
