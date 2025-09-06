// update-checker.js

// --- 1. PWA Auto-Update ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js')
    .then(registration => {
      console.log('Service Worker registered');

      // Listen for updates
      registration.onupdatefound = () => {
        const installingWorker = registration.installing;
        installingWorker.onstatechange = () => {
          if (installingWorker.state === 'installed') {
            if (navigator.serviceWorker.controller) {
              // New content available, show prompt to user
              const update = confirm('A new version of Sadak-Sathi is available. Reload to update?');
              if (update) window.location.reload();
            }
          }
        };
      };
    })
    .catch(error => console.error('Service Worker registration failed:', error));
}

// --- 2. Play Store Update Reminder ---
function checkPlayStoreUpdate(currentVersionCode) {
  if (window.AndroidUpdateChecker) {
    window.AndroidUpdateChecker.checkForUpdate(currentVersionCode)
      .then(updateAvailable => {
        if (updateAvailable) {
          const update = confirm('A new version of Sadak-Sathi is available on Play Store. Update now?');
          if (update) {
            window.open('https://play.google.com/store/apps/details?id=com.sadaksathi.app', '_blank');
          }
        }
      })
      .catch(err => console.error('Play Store update check failed:', err));
}

// Example usage: replace 42 with your current app version code
checkPlayStoreUpdate(42);

// --- Optional: Poll periodically every 6 hours ---
setInterval(() => {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistration().then(reg => reg?.update());
  }
  checkPlayStoreUpdate(42);
}, 6 * 60 * 60 * 1000); // 6 hours
