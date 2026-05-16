import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Scan } from "lucide-react";
import { RJLogo } from "./components/Brand/Logo";
import { PriceCalculator } from "./components/PriceCalculator";
import { QRScanner } from "./components/QRScanner";

export const PriceCalculatorPage = () => {
  const navigate = useNavigate();
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleScanQR = (scannedData: string) => {
    alert(JSON.stringify({ scannedData }, null, 2)); // Debug alert to show scanned data
    try {
      // If it's a full URL, extract the parameters
      if (scannedData.includes("?")) {
        const url = new URL(scannedData, window.location.origin);
        const d = url.searchParams.get("d");
        const i = url.searchParams.get("i");

        // Navigate with the extracted params
        if (d || i) {
          navigate(
            `/price-calculator?${new URLSearchParams({
              ...(d && { d }),
              ...(i && { i }),
            }).toString()}`
          );
          return;
        }
      } else if (scannedData.startsWith("http")) {
        // It's a URL but without ? - try to parse it
        const url = new URL(scannedData);
        const d = url.searchParams.get("d");
        const i = url.searchParams.get("i");

        if (d || i) {
          navigate(
            `/price-calculator?${new URLSearchParams({
              ...(d && { d }),
              ...(i && { i }),
            }).toString()}`
          );
          return;
        }
      }

      // If it's just the data string (like "g_10_15_1_0"), use it directly
      if (scannedData && !scannedData.includes("://")) {
        navigate(`/price-calculator?d=${encodeURIComponent(scannedData)}`);
      }
    } catch (error) {
      console.error("Error parsing scanned QR code:", error);
      // Still try to navigate with the raw data
      navigate(`/price-calculator?d=${encodeURIComponent(scannedData)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-stone-50 via-white to-stone-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-gray-100 shadow-sm">
        <div className="max-w-lg mx-auto flex items-center justify-between py-3 px-4">
          <RJLogo className="h-10" />
          <button
            onClick={() => setIsScannerOpen(true)}
            className="p-2 hover:bg-amber-50 rounded-lg transition-colors active:scale-95"
            title="Scan QR code"
            aria-label="Scan QR code"
          >
            <Scan className="w-5 h-5 text-amber-600 hover:text-amber-700" />
          </button>
        </div>
      </div>

      {/* Calculator */}
      <PriceCalculator />

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanQR}
      />
    </div>
  );
};