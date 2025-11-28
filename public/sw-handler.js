/// <reference lib="webworker" />

// This script is injected into the service worker to handle manual updates
if (typeof self !== 'undefined' && self instanceof WorkerGlobalScope) {
  self.addEventListener('message', (event) => {
    if (event.data.type === 'SKIP_WAITING') {
      self.skipWaiting();
    }
  });
}
