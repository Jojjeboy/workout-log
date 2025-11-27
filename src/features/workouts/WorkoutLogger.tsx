import { useState } from 'react';
import { Button, NumberInput, Stack, ActionIcon, Table } from '@mantine/core';
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
        <Stack>
            <Table>
                <Table.Thead>
                    <Table.Tr>
                        <Table.Th>Set</Table.Th>
                        <Table.Th>kg</Table.Th>
                        <Table.Th>Reps</Table.Th>
                        <Table.Th></Table.Th>
                    </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                    {sets.map((set, index) => (
                        <Table.Tr key={index}>
                            <Table.Td>{index + 1}</Table.Td>
                            <Table.Td>
                                <NumberInput
                                    value={set.weight}
                                    onChange={(v) => updateSet(index, 'weight', Number(v))}
                                    min={0}
                                    step={2.5}
                                    hideControls
                                />
                            </Table.Td>
                            <Table.Td>
                                <NumberInput
                                    value={set.reps}
                                    onChange={(v) => updateSet(index, 'reps', Number(v))}
                                    min={0}
                                    hideControls
                                />
                            </Table.Td>
                            <Table.Td>
                                <ActionIcon color="red" variant="subtle" onClick={() => removeSet(index)}>
                                    <IconTrash size={16} />
                                </ActionIcon>
                            </Table.Td>
                        </Table.Tr>
                    ))}
                </Table.Tbody>
            </Table>

            <Button variant="outline" leftSection={<IconPlus size={16} />} onClick={addSet}>
                Add Set
            </Button>

            <Button onClick={handleSave} loading={isSaving} fullWidth mt="md">
                Log Workout
            </Button>
        </Stack>
    );
}
