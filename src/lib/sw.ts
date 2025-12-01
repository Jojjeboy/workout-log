const emitter = new EventTarget();
let updateListenerAdded = false;

export function onUpdateAvailable(cb: () => void) {
  emitter.addEventListener('update-available', cb as EventListener);
}

export function offUpdateAvailable(cb: () => void) {
  emitter.removeEventListener('update-available', cb as EventListener);
}

function emitUpdateAvailable() {
  emitter.dispatchEvent(new Event('update-available'));
}

export async function getRegistration(): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) return undefined;
  try {
    return await navigator.serviceWorker.getRegistration();
  } catch (err) {
    console.error('getRegistration error', err);
    return undefined;
  }
}

export async function checkForUpdates() {
  const reg = await getRegistration();
  if (!reg) return;

  // Don't add multiple update listeners
  if (!updateListenerAdded) {
    updateListenerAdded = true;

    reg.addEventListener('updatefound', () => {
      const installing = reg.installing;
      if (!installing) return;

      installing.addEventListener('statechange', () => {
        if (installing.state === 'installed' && reg.waiting) {
          emitUpdateAvailable();
        }
      });
    });
  }

  try {
    // Trigger an update check
    await reg.update();

    // After update check, if there's a waiting worker, emit immediately
    if (reg.waiting) {
      emitUpdateAvailable();
    }
  } catch (err) {
    console.error('checkForUpdates error', err);
  }
}

export async function forceUpdate(): Promise<boolean> {
  const reg = await getRegistration();
  if (!reg) return false;

  try {
    if (reg.waiting) {
      (reg.waiting as ServiceWorker).postMessage({ type: 'SKIP_WAITING' });
      return true;
    }

    await reg.update();
    if (reg.waiting) {
      (reg.waiting as ServiceWorker).postMessage({ type: 'SKIP_WAITING' });
      return true;
    }

    return false;
  } catch (err) {
    console.error('forceUpdate error', err);
    return false;
  }
}
