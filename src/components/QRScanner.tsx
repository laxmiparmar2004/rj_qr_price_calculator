import { useEffect, useRef, useState } from "react";
import { X, Lightbulb } from "lucide-react";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";
import { RJLogo } from "./Brand/Logo";

const QrScanner = Scanner as any; // Handle module export

interface QRScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

export const QRScanner = ({ isOpen, onClose, onScan }: QRScannerProps) => {
  const scannerRef = useRef<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isTorchOn, setIsTorchOn] = useState(false);
  const [zoom, setZoom] = useState(1); // Zoom level: 1 = 100%, 2 = 200%, etc.
  const maxZoom = 4;
  const minZoom = 1;
 const devices = useDevices();
 const [selectedDeviceId, setSelectedDeviceId] = useState<string>("");


  // Stop scanner immediately when modal closes
  useEffect(() => {
    if (!isOpen) {
      setError(null);
      setZoom(1);
    }
  }, [isOpen]);

  const handleScan = (data: any) => {
    if (data) {;
      console.log("QR Code scanned:", data);
      // Since its raect qr code
      data = data?.[0]?.rawValue;
      onScan(data);
      onClose();
    }
  };

  const handleError = (err: any) => {
    if (err?.name === "NotAllowedError") {
      setError("Camera permission denied. Please allow camera access.");
    } else if (err?.name === "NotFoundError") {
      setError("No camera found on this device.");
    } else if (err?.name === "NotReadableError") {
      setError("Camera is already in use by another application.");
    } else {
      console.error("Scanner error:", err);
      // Don't show error for decode failures
      if (err?.message && !err.message.includes("QR code not found")) {
        setError(err.message || "Failed to access camera.");
      }
    }
  };

  const toggleTorch = async () => {
    try {
      if (scannerRef.current) {
        // react-qr-scanner torch control
        const stream = scannerRef.current.stream;
        if (stream) {
          const track = stream.getVideoTracks()[0];
          const capabilities = track.getCapabilities();

          if (capabilities.torch) {
            await track.applyConstraints({
              advanced: [{ torch: !isTorchOn }],
            });
            setIsTorchOn(!isTorchOn);
          }
        }
      }
    } catch (err) {
      console.error("Torch not supported:", err);
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.5, maxZoom));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.5, minZoom));
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (e.deltaY < 0) {
      handleZoomIn();
    } else {
      handleZoomOut();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black z-50 flex flex-col"
      onWheel={handleWheel}
    >
      {/* Header */}
      <div className="z-120 flex items-center justify-between px-4 py-3 bg-black/80 backdrop-blur-sm border-b border-gray-800">
        
        <div className="flex items-center justify-between w-full gap-2">
          <RJLogo className="h-10" />
          <div>

            <button
              onClick={toggleTorch}
              className={`p-2 rounded-lg transition-colors ${
                isTorchOn
                  ? "bg-yellow-500 hover:bg-yellow-600 text-white"
                  : "hover:bg-white/10 text-gray-300"
              }` }
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
      </div>

      {/* Camera View - Full Screen */}
      <div
        className="relative bg-black flex-1 overflow-hidden"
        onWheel={handleWheel}
      >
        {!error ? (
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "center",
              transition: "transform 0.2s ease-out",
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <QrScanner
              ref={scannerRef}
              delay={300}
              onError={handleError}
              onScan={handleScan}
              style={{ width: "100%", height: "100%" }}
              components={{
                audio: true, // Play beep sound on scan
                onOff: true, // Show camera on/off button
                torch: true, // Show torch/flashlight button (if supported)
                zoom: true, // Show zoom control (if supported)
                finder: true, // Show finder overlay
              }}
              constraints={{
                audio: false,
                
                video: {
                  deviceId: selectedDeviceId,
                  facingMode: "environment",
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                },
              }}
            />
          </div>
        ) : null}

        {/* Select device option top center */}
        {devices.length > 1 && (
          <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-30 bg-black/80 backdrop-blur-sm border border-gray-700 rounded-lg px-3 py-2">
            <select
              value={selectedDeviceId}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="bg-black text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              {devices.map((device) => (
                <option key={device.deviceId} value={device.deviceId}>
                  {device.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Scan Frame Overlay */}
        {!error && (
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
      {!error && (
        <div className="absolute bottom-8 left-0 right-0 text-center pointer-events-none">
          <p className="text-white text-sm font-medium bg-black/50 backdrop-blur-sm px-4 py-2 rounded-full inline-block">
            Position the QR code in the frame to scan
          </p>
        </div>
      )}
    </div>
  );
};
