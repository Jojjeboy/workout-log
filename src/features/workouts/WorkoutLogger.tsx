import { useState } from 'react';
import { Button, NumberInput, Stack, ActionIcon, Group, Text, Paper, Table, Alert } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconTrash, IconCheck, IconCalendar } from '@tabler/icons-react';
import { WorkoutSet } from '../../types';
import { showNotification } from '@mantine/notifications';

interface WorkoutLoggerProps {
    onSave: (sets: WorkoutSet[], date: Date) => void;
    isSaving: boolean;
    initialSets?: WorkoutSet[];
    initialDate?: Date;
    onSaveSuccess?: () => void;
}

export function WorkoutLogger({ onSave, isSaving, initialSets, initialDate, onSaveSuccess }: WorkoutLoggerProps) {
    const [sets, setSets] = useState<WorkoutSet[]>(
        initialSets || [{ weight: 0, reps: 0, completed: false }]
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || new Date());
    const [showSuccess, setShowSuccess] = useState(false);

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

    const toggleComplete = (index: number) => {
        const newSets = [...sets];
        newSets[index] = { ...newSets[index], completed: !newSets[index].completed };
        setSets(newSets);
    };

    const handleSave = () => {
        if (!selectedDate) return;
        onSave(sets, selectedDate);
        
        // Show success notification
        showNotification({
            title: 'Workout Logged',
            message: 'Your workout has been saved successfully!',
            color: 'green',
            icon: <IconCheck size={16} />,
            autoClose: 3000,
        });

        // Reset form
        setSets([{ weight: 0, reps: 0, completed: false }]);
        setSelectedDate(new Date());
        setShowSuccess(true);

        // Hide success alert after 3 seconds
        setTimeout(() => setShowSuccess(false), 3000);

        // Call optional callback
        if (onSaveSuccess) {
            onSaveSuccess();
        }
    };

    return (
        <Stack gap="md">
            {showSuccess && (
                <Alert
                    icon={<IconCheck size={16} />}
                    title="Workout Logged!"
                    color="green"
                    radius="md"
                    withCloseButton
                    onClose={() => setShowSuccess(false)}
                >
                    Your workout has been saved successfully and will be synced to the cloud.
                </Alert>
            )}

            <Paper withBorder radius="sm" p={0} style={{ overflow: 'hidden' }}>
                <Table verticalSpacing="sm" withRowBorders>
                    <Table.Thead bg="#f8f9fa">
                        <Table.Tr>
                            <Table.Th style={{ width: '40px', textAlign: 'center' }}>#</Table.Th>
                            <Table.Th>Weight (kg)</Table.Th>
                            <Table.Th>Reps</Table.Th>
                            <Table.Th style={{ width: '40px' }}></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {sets.map((set, index) => (
                            <Table.Tr key={index} bg={set.completed ? '#f0fff4' : undefined}>
                                <Table.Td style={{ textAlign: 'center' }}>
                                    <Text size="sm" fw={500} c="dimmed">{index + 1}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        value={set.weight}
                                        onChange={(v) => updateSet(index, 'weight', Number(v))}
                                        min={0}
                                        step={2.5}
                                        hideControls
                                        variant="filled"
                                        radius="xs"
                                        styles={{ input: { textAlign: 'center', fontWeight: 600 } }}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        value={set.reps}
                                        onChange={(v) => updateSet(index, 'reps', Number(v))}
                                        min={0}
                                        hideControls
                                        variant="filled"
                                        radius="xs"
                                        styles={{ input: { textAlign: 'center', fontWeight: 600 } }}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Group gap={4} wrap="nowrap">
                                        <ActionIcon
                                            color={set.completed ? "green" : "gray"}
                                            variant={set.completed ? "filled" : "subtle"}
                                            onClick={() => toggleComplete(index)}
                                            size="md"
                                            radius="xs"
                                        >
                                            <IconCheck size={16} />
                                        </ActionIcon>
                                        <ActionIcon
                                            color="red"
                                            variant="subtle"
                                            onClick={() => removeSet(index)}
                                            size="md"
                                            radius="xs"
                                            disabled={sets.length === 1}
                                        >
                                            <IconTrash size={16} />
                                        </ActionIcon>
                                    </Group>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>

            <DatePickerInput
                value={selectedDate}
                onChange={(value) => {
                    if (typeof value === 'string') {
                        setSelectedDate(new Date(value));
                    } else {
                        setSelectedDate(value);
                    }
                }}
                label="Workout Date"
                placeholder="Pick date"
                leftSection={<IconCalendar size={16} />}
                clearable={false}
                valueFormat="DD MMM YYYY"
                radius="xs"
            />

            <Group grow>
                <Button
                    variant="light"
                    color="darkBlue"
                    leftSection={<IconPlus size={16} />}
                    onClick={addSet}
                    radius="xs"
                >
                    Add Set
                </Button>
                <Button
                    onClick={handleSave}
                    loading={isSaving}
                    color="darkBlue"
                    radius="xs"
                >
                    Log Workout
                </Button>
            </Group>
        </Stack>
    );
}
