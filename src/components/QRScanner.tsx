import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
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
  }, [isOpen, onClose, onScan]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Scan QR Code</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close scanner"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Camera View */}
        <div className="relative bg-black aspect-square overflow-hidden">
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

        {/* Error Message */}
        {error && (
          <div className="px-6 py-4 bg-red-50 border-t border-red-200">
            <p className="text-sm text-red-700">{error}</p>
            <button
              onClick={onClose}
              className="mt-3 w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
            >
              Close
            </button>
          </div>
        )}

        {/* Instructions */}
        {!error && (
          <div className="px-6 py-4 bg-gray-50 text-center text-sm text-gray-600">
            <p>Position the QR code in the frame to scan</p>
          </div>
        )}
      </div>
    </div>
  );
};
