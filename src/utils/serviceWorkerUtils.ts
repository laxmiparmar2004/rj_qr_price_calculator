// Hook to register and manage the service worker
export const registerServiceWorker = async () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Workers not supported");
    return;
  }

  try {
    // Register the service worker
    const registration = await navigator.serviceWorker.register("/service-worker.js", {
      scope: "/",
    });

    console.log("Service Worker registered successfully:", registration);

    // Listen for updates
    registration.addEventListener("updatefound", () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener("statechange", () => {
        if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
          // New service worker available, notify user
          console.log("New version available! Please refresh.");
          // Optionally show a notification to the user
          notifyNewVersionAvailable();
        }
      });
    });

    // Check for updates periodically (every hour)
    setInterval(() => {
      registration.update();
    }, 60 * 60 * 1000);
  } catch (error) {
    console.error("Service Worker registration failed:", error);
  }
};

const notifyNewVersionAvailable = () => {
  // You can implement a toast or banner here
  const event = new CustomEvent("newVersionAvailable");
  window.dispatchEvent(event);
};

// Function to skip waiting (used for immediate update)
export const skipWaiting = () => {
  const registration = navigator.serviceWorker.controller;
  if (registration) {
    registration.postMessage({ type: "SKIP_WAITING" });
    window.location.reload();
  }
};

// Send manual rates to service worker
export const sendManualRatesToServiceWorker = (ratesData: any) => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "SAVE_MANUAL_RATES",
      payload: ratesData,
    });
  }
};

// Clear manual rates from service worker
export const clearManualRatesFromServiceWorker = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: "CLEAR_MANUAL_RATES",
    });
  }
};

// Check if app is online
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupOnlineStatusListener = (callback: (isOnline: boolean) => void) => {
  window.addEventListener("online", () => callback(true));
  window.addEventListener("offline", () => callback(false));
};
