import { useEffect, useRef, useState } from "react";
import { X, Lightbulb } from "lucide-react";
import QrScanner from "qr-scanner";

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScanner = ({ isOpen, onClose, onScan }: QRScannerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [scanner, setScanner] = useState<QrScanner | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isTorchOn, setIsTorchOn] = useState(false);

  useEffect(() => {
    if (!isOpen || !videoRef.current) return;

    setIsLoading(true);
    setError(null);

    const initScanner = async () => {
      try {
        const qrScanner = new QrScanner(
          videoRef.current!,
          (result) => {
           const scannedData = result.data;
            onScan(scannedData);
            qrScanner.stop();
            onClose();
          },
          {
            onDecodeError: (error) => {
              // Silently ignore decode errors
              console.debug("Decode error:", error);
            },
            maxScansPerSecond: 5,
            preferredCamera: "environment", // Use back camera
            highlightCodeOutlineColor: "rgb(255, 193, 7)",
            highlightScanRegion: true,
            // Enhanced camera constraints for better focus
            calculateScanRegion: (video) => {
              const dedectionAreaPercent = 0.75;
              const width = video.videoWidth;
              const height = video.videoHeight;
              const margin = Math.min(width, height) * (1 - dedectionAreaPercent) / 2;
              return {
                x: margin,
                y: margin,
                width: width - 2 * margin,
                height: height - 2 * margin,
              };
            },
          },
          {
            facingMode: "environment", // Back camera
            // Request high resolution for better QR detection
            width: { min: 360, ideal: 1920, max: 1920 },
            height: { min: 360, ideal: 1920, max: 1920 },
            // Enable autofocus
            focusMode: [{ exact: "continuous" }],
            // Improve focus distance
            focusDistance: [{ exact: 0 }],
          }
        );

        setScanner(qrScanner);
        await qrScanner.start();
        setIsLoading(false);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to access camera. Please check permissions."
        );
        setIsLoading(false);
      }
    };

    initScanner();

    return () => {
      if (scanner) {
        scanner.stop();
        scanner.destroy();
      }
    };
  }, [isOpen, onClose, onScan, scanner]);

  const toggleTorch = async () => {
    if (!scanner) return;
    try {
      await scanner.toggleFlash();
      setIsTorchOn(!isTorchOn);
    } catch (err) {
      console.error("Flash not supported on this device:", err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        <h2 className="text-lg font-semibold text-white">Scan QR Code</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTorch}
            className={`p-2 rounded-lg transition-colors ${
              isTorchOn 
                ? "bg-yellow-500 hover:bg-yellow-600 text-white" 
                : "hover:bg-white/10 text-gray-300"
            }`}
            aria-label="Toggle flashlight"
            title="Toggle flashlight"
          >
            <Lightbulb className="w-5 h-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Camera View - Full Screen */}
      <div className="relative bg-black flex-1 overflow-hidden">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black">
              <div className="text-center space-y-3">
                <div className="relative mx-auto w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-3 border-amber-200" />
                  <div className="absolute inset-0 rounded-full border-3 border-amber-500 border-t-transparent animate-spin" />
                </div>
                <p className="text-white text-sm">Initializing camera...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ display: isLoading ? "none" : "block" }}
          />

          {/* Scan Frame */}
          {!isLoading && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="relative w-48 h-48 border-2 border-amber-400">
                {/* Corner markers */}
                <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-amber-400" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-amber-400" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-amber-400" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-amber-400" />
              </div>
            </div>
          )}
      </div>

      {/* Error/Instructions Overlay */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-red-900/90 border border-red-700 rounded-2xl px-6 py-8 max-w-sm text-center space-y-4">
            <p className="text-sm text-red-100">{error}</p>
            <button
              onClick={onClose}
              className="w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Instructions Overlay */}
      {!error && !isLoading && (
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
          <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">Position the QR code in the frame to scan</p>
        </div>
      )}
    </div>
  );
};
