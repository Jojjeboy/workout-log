import { useState } from 'react';
import { Button, NumberInput, Stack, ActionIcon, Group, Text, Paper } from '@mantine/core';
import { IconPlus, IconTrash } from '@tabler/icons-react';
import { WorkoutSet } from '../../types';

interface WorkoutLoggerProps {
    onSave: (sets: WorkoutSet[]) => void;
    isSaving: boolean;
}

export function WorkoutLogger({ onSave, isSaving }: WorkoutLoggerProps) {
    const [sets, setSets] = useState<WorkoutSet[]>([
        { weight: 0, reps: 0, completed: false }
    ]);

    const addSet = () => {
        const lastSet = sets[sets.length - 1];
        setSets([...sets, { ...lastSet, completed: false }]);
    };

    const removeSet = (index: number) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const updateSet = (index: number, field: keyof WorkoutSet, value: number) => {
        const newSets = [...sets];
        newSets[index] = { ...newSets[index], [field]: value };
        setSets(newSets);
    };

    const handleSave = () => {
        // Filter out empty or incomplete sets if needed, but for now save all
        onSave(sets);
    };

    return (
        <Stack gap="sm">
            {/* Header */}
            <Group justify="space-between" mb="xs">
                <Text size="sm" fw={600} c="#1a202c">Set</Text>
                <Group gap="md" style={{ flex: 1 }}>
                    <Text size="sm" fw={600} c="#1a202c" style={{ width: '50px' }}>Weight (kg)</Text>
                    <Text size="sm" fw={600} c="#1a202c" style={{ width: '50px' }}>Reps</Text>
                </Group>
            </Group>

            {/* Set inputs */}
            {sets.map((set, index) => (
                <Paper key={index} p="sm" radius="md" withBorder bg="rgba(255,255,255,0.5)">
                    <Group justify="space-between" gap="md">
                        <Text c="#1a202c" fw={500} style={{ minWidth: '20px' }}>{index + 1}</Text>
                        <NumberInput
                            value={set.weight}
                            onChange={(v) => updateSet(index, 'weight', Number(v))}
                            min={0}
                            step={2.5}
                            hideControls
                            placeholder="0"
                            style={{ width: '50px' }}
                        />
                        <NumberInput
                            value={set.reps}
                            onChange={(v) => updateSet(index, 'reps', Number(v))}
                            min={0}
                            hideControls
                            placeholder="0"
                            style={{ width: '50px' }}
                        />
                        <ActionIcon color="red" variant="subtle" onClick={() => removeSet(index)} size="sm">
                            <IconTrash size={16} />
                        </ActionIcon>
                    </Group>
                </Paper>
            ))}

            <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={addSet}>
                Add Set
            </Button>

            <Button onClick={handleSave} loading={isSaving} fullWidth mt="md">
                Log Workout
            </Button>
        </Stack>
    );
}


