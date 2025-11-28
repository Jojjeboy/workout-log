import { useEffect, useState } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('serviceWorker' in navigator)) {
      return;
    }

    // Listen for controller change (indicates update was applied)
    const handleControllerChange = () => {
      setUpdateAvailable(false);
    };

    navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

    // Check for updates periodically
    const checkForUpdates = async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        if (reg) {
          setRegistration(reg);
          await reg.update();
        }
      } catch (error) {
        console.error('Error checking for updates:', error);
      }
    };

    // Check on mount
    checkForUpdates();

    // Check every 60 seconds
    const interval = setInterval(checkForUpdates, 60000);

    return () => {
      clearInterval(interval);
      navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
    };
  }, []);

  useEffect(() => {
    if (!registration) return;

    const handleUpdate = () => {
      // Check if there's a waiting service worker (new version available)
      if (registration.waiting) {
        setUpdateAvailable(true);
      }
    };

    // Listen for updates
    registration.addEventListener('updatefound', handleUpdate);

    // Also check if there's already a waiting service worker
    if (registration.waiting) {
      setUpdateAvailable(true);
    }

    return () => {
      registration.removeEventListener('updatefound', handleUpdate);
    };
  }, [registration]);

  const handleUpdate = () => {
    if (registration?.waiting) {
      // Tell the waiting service worker to activate
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Wait for the controller to change, then reload
      const reloadPage = () => {
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', reloadPage, { once: true });
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
          <Button variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
