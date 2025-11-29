import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../lib/sw';
import { showNotification } from '@mantine/notifications';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  // prevent re-showing the modal while an update is being applied
  const applyingRef = useRef(false);

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
    if (applyingRef.current) return; // guard
    applyingRef.current = true;
    const applied = await forceUpdate();
    if (applied) {
      // hide modal immediately to avoid re-show
      setUpdateAvailable(false);
      showNotification({ title: 'Updating', message: 'Applying update and reloading...', color: 'blue' });

      // If controllerchange doesn't fire (browser quirk), fallback to reload after short delay
      const reloadTimeout = setTimeout(() => {
        try {
          window.location.reload();
        } catch (err) {
          // ignore
        }
      }, 2000);

      // clear timeout if controllerchange happens first
      const onControllerOnce = () => {
        clearTimeout(reloadTimeout);
        // reload to ensure new content is shown
        try { window.location.reload(); } catch (e) {}
      };
      navigator.serviceWorker.addEventListener('controllerchange', onControllerOnce, { once: true });
    } else {
      showNotification({ title: 'No Update', message: 'No update was available.', color: 'gray' });
      applyingRef.current = false;
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
