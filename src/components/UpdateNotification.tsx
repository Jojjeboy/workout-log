import { useEffect, useState } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../lib/sw';
import { showNotification } from '@mantine/notifications';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const handle = () => setUpdateAvailable(true);
    onUpdateAvailable(handle);
    // Trigger an initial check
    checkForUpdates();
    return () => offUpdateAvailable(handle);
  }, []);

  useEffect(() => {
    const onController = () => setUpdateAvailable(false);
    navigator.serviceWorker.addEventListener('controllerchange', onController);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onController);
  }, []);

  const handleUpdate = async () => {
    const applied = await forceUpdate();
    if (applied) {
      showNotification({ title: 'Updating', message: 'Applying update and reloading...', color: 'blue' });
      // reload will happen on controllerchange
    } else {
      showNotification({ title: 'No Update', message: 'No update was available.', color: 'gray' });
      setUpdateAvailable(false);
    }
  };

  const handleCancel = () => {
    setUpdateAvailable(false);
  };

  return (
    <Modal
      opened={updateAvailable}
      onClose={handleCancel}
      title={
        <Group gap="xs">
          <IconAlertCircle size={20} color="blue" />
          <Text fw={600}>New Version Available</Text>
        </Group>
      }
      centered
      withCloseButton={false}
      size="sm"
    >
      <Stack gap="md">
        <Text size="sm" c="dimmed">
          A new version of the application is available. Would you like to update now?
        </Text>
        <Group justify="flex-end" gap="sm">
          <Button variant="outline" color="gray" onClick={handleCancel} radius="xs">
            Cancel
          </Button>
          <Button onClick={handleUpdate} color="darkBlue" radius="xs">
            Update
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
