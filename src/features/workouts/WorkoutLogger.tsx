import { useState } from 'react';
import { Button, NumberInput, Stack, ActionIcon, Group, Text, Paper, Table, Alert } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { IconPlus, IconTrash, IconCheck, IconCalendar } from '@tabler/icons-react';
import { WorkoutSet } from '../../types';
import { showNotification } from '@mantine/notifications';
import { useTranslation } from 'react-i18next';

interface WorkoutLoggerProps {
    onSave: (sets: WorkoutSet[], date: Date) => void;
    isSaving: boolean;
    initialSets?: WorkoutSet[];
    initialDate?: Date;
    onSaveSuccess?: () => void;
}

interface WorkoutSetInput {
    weight: number | string;
    reps: number | string;
    rpe?: number;
}

export function WorkoutLogger({ onSave, isSaving, initialSets, initialDate, onSaveSuccess }: WorkoutLoggerProps) {
    const { t } = useTranslation();
    // Initialize with empty strings for new sets to show placeholder
    const [sets, setSets] = useState<WorkoutSetInput[]>(
        initialSets ? initialSets.map(s => ({ ...s })) : [{ weight: '', reps: '' }]
    );
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || new Date());
    const [showSuccess, setShowSuccess] = useState(false);

    const addSet = () => {
        // Copy the previous set's values if they exist, otherwise empty
        const lastSet = sets[sets.length - 1];
        if (lastSet && (lastSet.weight !== '' || lastSet.reps !== '')) {
            setSets([...sets, { ...lastSet }]);
        } else {
            setSets([...sets, { weight: '', reps: '' }]);
        }
    };

    const removeSet = (index: number) => {
        setSets(sets.filter((_, i) => i !== index));
    };

    const updateSet = (index: number, field: keyof Omit<WorkoutSetInput, 'rpe'>, value: number | string) => {
        const newSets = [...sets];
        newSets[index] = { ...newSets[index], [field]: value };
        setSets(newSets);
    };

    const handleSave = () => {
        if (!selectedDate) return;

        // Validate sets
        const validSets: WorkoutSet[] = [];
        for (const set of sets) {
            const weight = Number(set.weight);
            const reps = Number(set.reps);

            // Check if values are valid numbers and reps > 0 (weight can be 0 for bodyweight)
            if (set.weight === '' || set.reps === '' || isNaN(weight) || isNaN(reps) || reps <= 0) {
                showNotification({
                    title: t('common.error'),
                    message: t('workoutLogger.invalidSetsMessage'), // You might need to add this key or use a generic one
                    color: 'red',
                });
                return;
            }

            validSets.push({ weight, reps, rpe: set.rpe });
        }

        if (validSets.length === 0) return;

        onSave(validSets, selectedDate);

        // Show success notification
        showNotification({
            title: t('workoutLogger.workoutLogged'),
            message: t('workoutLogger.workoutLoggedMessage'),
            color: 'green',
            icon: <IconCheck size={16} />,
            autoClose: 3000,
        });

        // Reset form
        setSets([{ weight: '', reps: '' }]);
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
                    title={t('workoutLogger.workoutLoggedTitle')}
                    color="green"
                    radius="md"
                    withCloseButton
                    onClose={() => setShowSuccess(false)}
                >
                    {t('workoutLogger.workoutSyncMessage')}
                </Alert>
            )}

            <DatePickerInput
                value={selectedDate}
                onChange={(value) => {
                    if (typeof value === 'string') {
                        setSelectedDate(new Date(value));
                    } else {
                        setSelectedDate(value);
                    }
                }}
                label={t('workoutLogger.workoutDate')}
                placeholder={t('workoutLogger.pickDate')}
                leftSection={<IconCalendar size={16} />}
                clearable={false}
                valueFormat="DD MMM YYYY"
                radius="xs"
                maxDate={new Date()}
            />

            <Paper withBorder radius="sm" p={0} style={{ overflow: 'hidden' }}>
                <Table verticalSpacing="sm" withRowBorders>
                    <Table.Thead bg="#f8f9fa">
                        <Table.Tr>
                            <Table.Th style={{ width: '40px', textAlign: 'center' }}>#</Table.Th>
                            <Table.Th>{t('dashboard.weight')}</Table.Th>
                            <Table.Th>{t('dashboard.reps')}</Table.Th>
                            <Table.Th style={{ width: '40px' }}></Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {sets.map((set, index) => (
                            <Table.Tr key={index}>
                                <Table.Td style={{ textAlign: 'center' }}>
                                    <Text size="sm" fw={500} c="dimmed">{index + 1}</Text>
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        value={set.weight}
                                        onChange={(v) => updateSet(index, 'weight', v)}
                                        min={0}
                                        step={2.5}
                                        hideControls
                                        variant="filled"
                                        radius="xs"
                                        placeholder="0"
                                        allowNegative={false}
                                        styles={{ input: { textAlign: 'center', fontWeight: 600 } }}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <NumberInput
                                        value={set.reps}
                                        onChange={(v) => updateSet(index, 'reps', v)}
                                        min={0}
                                        hideControls
                                        variant="filled"
                                        radius="xs"
                                        placeholder="0"
                                        allowNegative={false}
                                        allowDecimal={false}
                                        styles={{ input: { textAlign: 'center', fontWeight: 600 } }}
                                    />
                                </Table.Td>
                                <Table.Td>
                                    <Group gap={4} wrap="nowrap">
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

            <Group grow>
                <Button
                    variant="light"
                    color="darkBlue"
                    leftSection={<IconPlus size={16} />}
                    onClick={addSet}
                    radius="xs"
                >
                    {t('workoutLogger.addSet')}
                </Button>
                <Button
                    onClick={handleSave}
                    loading={isSaving}
                    color="darkBlue"
                    radius="xs"
                >
                    {t('workoutLogger.logWorkout')}
                </Button>
            </Group>
        </Stack>
    );
}
