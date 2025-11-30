import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';

interface ConfirmDialogProps {
    opened: boolean;
    title: string;
    message: string;
    confirmLabel?: string;
    cancelLabel?: string;
    isDangerous?: boolean;
    onConfirm: () => void;
    onCancel: () => void;
    isLoading?: boolean;
}

export function ConfirmDialog({
    opened,
    title,
    message,
    confirmLabel = 'Delete',
    cancelLabel = 'Cancel',
    isDangerous = true,
    onConfirm,
    onCancel,
    isLoading = false,
}: ConfirmDialogProps) {
    return (
        <Modal
            opened={opened}
            onClose={onCancel}
            title={
                <Group gap="xs">
                    {isDangerous && <IconAlertTriangle size={20} color="red" />}
                    <Text fw={600}>{title}</Text>
                </Group>
            }
            centered
            withCloseButton={false}
        >
            <Stack gap="md">
                <Text size="sm" c="dimmed">
                    {message}
                </Text>
                <Group justify="flex-end" gap="sm">
                    <Button variant="outline" color="gray" onClick={onCancel} radius="xs">
                        {cancelLabel}
                    </Button>
                    <Button
                        onClick={onConfirm}
                        color={isDangerous ? 'red' : 'blue'}
                        radius="xs"
                        loading={isLoading}
                    >
                        {confirmLabel}
                    </Button>
                </Group>
            </Stack>
        </Modal>
    );
}
