import { Paper, Group, Text, Badge, ActionIcon, Menu, Stack } from '@mantine/core';
import { IconPlayerPlay, IconDots, IconEdit, IconCopy, IconTrash } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';
import { WorkoutRoutine } from '../types';
import { useTranslation } from 'react-i18next';
import { useDeleteRoutine, useDuplicateRoutine } from '../hooks/useRoutines';
import { useState } from 'react';
import { ConfirmDialog } from './ConfirmDialog';

interface RoutineCardProps {
    routine: WorkoutRoutine;
}

export function RoutineCard({ routine }: RoutineCardProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const deleteMutation = useDeleteRoutine();
    const duplicateMutation = useDuplicateRoutine();
    const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

    const formatDate = (timestamp?: number) => {
        if (!timestamp) return t('routines.neverUsed');
        return new Date(timestamp).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: new Date(timestamp).getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    };

    const handleStart = () => {
        navigate(`/routines/${routine.id}/active`);
    };

    const handleEdit = () => {
        navigate(`/routines/${routine.id}/edit`);
    };

    const handleDuplicate = () => {
        if (routine.id) {
            duplicateMutation.mutate(routine.id);
        }
    };

    const handleDelete = () => {
        setDeleteConfirmOpen(true);
    };

    const confirmDelete = () => {
        if (routine.id) {
            deleteMutation.mutate(routine.id);
            setDeleteConfirmOpen(false);
        }
    };

    return (
        <>
            <Paper p="lg" radius="lg" shadow="sm" bg="white" style={{ cursor: 'pointer' }}>
                <Group justify="space-between" wrap="nowrap">
                    <Stack gap="xs" style={{ flex: 1 }}>
                        <Group justify="space-between" wrap="nowrap">
                            <div style={{ flex: 1 }}>
                                <Text fw={600} size="lg" tt="capitalize" lineClamp={1}>
                                    {routine.name}
                                </Text>
                                {routine.description && (
                                    <Text size="sm" c="dimmed" lineClamp={1}>
                                        {routine.description}
                                    </Text>
                                )}
                            </div>
                        </Group>

                        <Group gap="sm">
                            <Badge variant="light" color="blue" size="sm">
                                {routine.exercises.length} {t('routines.exercises')}
                            </Badge>
                            {routine.lastUsed && (
                                <Text size="xs" c="dimmed">
                                    {t('routines.lastUsed')}: {formatDate(routine.lastUsed)}
                                </Text>
                            )}
                        </Group>
                    </Stack>

                    <Group gap="xs">
                        <ActionIcon
                            size="lg"
                            variant="filled"
                            color="blue"
                            onClick={handleStart}
                            radius="xl"
                        >
                            <IconPlayerPlay size={18} />
                        </ActionIcon>

                        <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                                <ActionIcon size="lg" variant="subtle" color="gray">
                                    <IconDots size={18} />
                                </ActionIcon>
                            </Menu.Target>

                            <Menu.Dropdown>
                                <Menu.Item leftSection={<IconEdit size={16} />} onClick={handleEdit}>
                                    {t('routines.edit')}
                                </Menu.Item>
                                <Menu.Item
                                    leftSection={<IconCopy size={16} />}
                                    onClick={handleDuplicate}
                                    disabled={duplicateMutation.isPending}
                                >
                                    {t('routines.duplicate')}
                                </Menu.Item>
                                <Menu.Divider />
                                <Menu.Item
                                    leftSection={<IconTrash size={16} />}
                                    color="red"
                                    onClick={handleDelete}
                                >
                                    {t('common.delete')}
                                </Menu.Item>
                            </Menu.Dropdown>
                        </Menu>
                    </Group>
                </Group>
            </Paper>

            <ConfirmDialog
                opened={deleteConfirmOpen}
                title={t('routines.deleteTitle')}
                message={t('routines.deleteMessage')}
                confirmLabel={t('common.delete')}
                cancelLabel={t('common.cancel')}
                onConfirm={confirmDelete}
                onCancel={() => setDeleteConfirmOpen(false)}
                isLoading={deleteMutation.isPending}
                isDangerous
            />
        </>
    );
}
