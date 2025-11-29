import { Button, Tooltip } from '@mantine/core';
import { IconRefresh, IconCloudUpload, IconFileImport } from '@tabler/icons-react';
import { useExerciseSync } from '../hooks/useExerciseSync';

export function SyncButton() {
    const { syncExercises, isSyncing } = useExerciseSync();

    return (
        <Tooltip label="Sync exercises from server">
            <Button
                onClick={() => syncExercises()}
                loading={isSyncing}
                leftSection={<IconRefresh size={16} />}
                color="darkBlue"
                radius="xs"
            >
                Sync Exercises
            </Button>
        </Tooltip>
    );
}

export function SyncFromJsonButton() {
    const { syncFromJson, isSyncingFromJson } = useExerciseSync();

    return (
        <Tooltip label="Load exercises from JSON and sync to Firebase">
            <Button
                onClick={() => syncFromJson()}
                loading={isSyncingFromJson}
                leftSection={<IconFileImport size={16} />}
                color="darkBlue"
                radius="xs"
                fullWidth
                variant="light"
                justify="space-between"
                rightSection={<span />} // Spacer to keep text centered or left aligned if needed, but justify space-between works well with leftSection
            >
                Sync Exercises
            </Button>
        </Tooltip>
    );
}

export function UploadButton({ exercises }: { exercises: any[] }) {
    const { uploadExercises, isUploading } = useExerciseSync();

    return (
        <Tooltip label="Upload ALL exercises to Firebase (Admin)">
            <Button
                onClick={() => uploadExercises(exercises)}
                loading={isUploading}
                leftSection={<IconCloudUpload size={16} />}
                color="red"
                variant="outline"
                radius="xs"
            >
                Upload to Cloud
            </Button>
        </Tooltip>
    );
}
