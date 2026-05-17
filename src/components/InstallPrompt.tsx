import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export const InstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showManualInstall, setShowManualInstall] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    const checkInstalled = () => {
      if (window.matchMedia("(display-mode: standalone)").matches) {
        setIsInstalled(true);
      }
    };

    checkInstalled();

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    // Listen for successful install
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleAppInstalled);

    // Show manual install after 5 seconds if prompt hasn't been shown
    const manualTimer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setShowManualInstall(true);
      }
    }, 5000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
      clearTimeout(manualTimer);
    };
  }, [deferredPrompt, isInstalled]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    try {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === "accepted") {
        console.log("App installed");
        setIsInstalled(true);
      }

      setDeferredPrompt(null);
      setShowPrompt(false);
    } catch (error) {
      console.error("Install error:", error);
    }
  };

  const handleManualInstall = () => {
    // For iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      alert(
        "To install this app on iOS:\n\n1. Tap the Share button\n2. Select 'Add to Home Screen'\n3. Choose 'Add'"
      );
    }
    // For Android Chrome and other browsers
    else if (deferredPrompt) {
      handleInstall();
    } else {
      alert(
        "To install this app:\n\n1. Open the browser menu (⋮)\n2. Select 'Install app' or 'Add to home screen'\n3. Confirm installation"
      );
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setShowManualInstall(false);
    setDeferredPrompt(null);
  };

  if (isInstalled) return null;

  // Show automatic install prompt
  if (showPrompt && deferredPrompt) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-40 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Download className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Install App</h3>
            <p className="text-gray-600 text-xs mt-0.5">
              Install RJ Price Calculator on your home screen for quick access and offline use.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Not now
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    );
  }

  // Show manual install option after 5 seconds
  if (showManualInstall) {
    return (
      <div className="fixed bottom-4 left-4 right-4 max-w-sm mx-auto bg-white rounded-xl shadow-lg border border-gray-200 p-4 z-40 animate-slide-up">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <Download className="w-5 h-5 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 text-sm">Get App</h3>
            <p className="text-gray-600 text-xs mt-0.5">
              Install RJ Price Calculator for offline access and better experience.
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex gap-2 mt-3">
          <button
            onClick={handleDismiss}
            className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Later
          </button>
          <button
            onClick={handleManualInstall}
            className="flex-1 px-3 py-2 text-sm font-medium text-white bg-gradient-to-r from-amber-500 to-amber-600 rounded-lg hover:from-amber-600 hover:to-amber-700 transition-colors"
          >
            Show me how
          </button>
        </div>
      </div>
    );
  }

  return null;
};
