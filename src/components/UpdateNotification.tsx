import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Group, Text, Stack } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';
import { onUpdateAvailable, offUpdateAvailable, checkForUpdates, forceUpdate } from '../lib/sw';
import { showNotification } from '@mantine/notifications';

const UPDATE_COOLDOWN_KEY = 'sw-update-timestamp';
const COOLDOWN_MS = 10000; // 10 seconds cooldown after update

function isInCooldown(): boolean {
  const lastUpdate = localStorage.getItem(UPDATE_COOLDOWN_KEY);
  if (!lastUpdate) return false;
  const elapsed = Date.now() - parseInt(lastUpdate, 10);
  return elapsed < COOLDOWN_MS;
}

function setUpdateTimestamp() {
  localStorage.setItem(UPDATE_COOLDOWN_KEY, Date.now().toString());
}

export function UpdateNotification() {
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const applyingRef = useRef(false);

  useEffect(() => {
    const handle = () => {
      // Don't show modal if we just completed an update
      if (!isInCooldown() && !applyingRef.current) {
        setUpdateAvailable(true);
      }
    };

    onUpdateAvailable(handle);

    // Delay the initial check to let the service worker settle after page load
    const checkTimer = setTimeout(() => {
      if (!isInCooldown()) {
        checkForUpdates();
      }
    }, 2000);

    return () => {
      offUpdateAvailable(handle);
      clearTimeout(checkTimer);
    };
  }, []);

  useEffect(() => {
    const onController = () => {
      setUpdateAvailable(false);
      applyingRef.current = false;
    };
    navigator.serviceWorker.addEventListener('controllerchange', onController);
    return () => navigator.serviceWorker.removeEventListener('controllerchange', onController);
  }, []);

  const handleUpdate = async () => {
    if (applyingRef.current) return;
    applyingRef.current = true;

    const applied = await forceUpdate();
    if (applied) {
      // Mark the update timestamp to prevent re-showing
      setUpdateTimestamp();
      setUpdateAvailable(false);
      showNotification({ title: 'Updating', message: 'Applying update and reloading...', color: 'blue' });

      // Fallback reload if controllerchange doesn't fire
      const reloadTimeout = setTimeout(() => {
        try {
          window.location.reload();
        } catch (err) {
          // ignore
        }
      }, 2000);

      // Clear timeout and reload when controller changes
      const onControllerOnce = () => {
        clearTimeout(reloadTimeout);
        try { window.location.reload(); } catch (e) { }
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
