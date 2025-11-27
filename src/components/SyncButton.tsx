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
                variant="gradient"
                gradient={{ from: 'violet.6', to: 'violet.3', deg: 45 }}
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
                variant="gradient"
                gradient={{ from: 'violet.6', to: 'violet.3', deg: 45 }}
                fullWidth
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
            >
                Upload to Cloud
            </Button>
        </Tooltip>
    );
}
