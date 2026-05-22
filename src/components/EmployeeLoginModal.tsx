import { useState } from "react";
import { Lock, LogOut } from "lucide-react";

interface EmployeeLoginModalProps {
  isOpen: boolean;
  isAuthenticated: boolean;
  onClose: () => void;
  onLogin: (otp: string) => boolean;
  onLogout: () => void;
}

export const EmployeeLoginModal = ({
  isOpen,
  isAuthenticated,
  onClose,
  onLogin,
  onLogout,
}: EmployeeLoginModalProps) => {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = () => {
    if (!otp) {
      setError("Please enter the OTP");
      return;
    }

    if (otp.length !== 6) {
      setError("OTP must be 6 digits");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      const success = onLogin(otp);
      if (!success) {
        setError("Invalid OTP. Please try again.");
        setOtp("");
      } else {
        setOtp("");
        setError("");
        onClose();
      }
      setIsLoading(false);
    }, 500);
  };

  const handleLogout = () => {
    onLogout();
    setOtp("");
    setError("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-600" />
            <h2 className="text-lg font-bold text-gray-900">
              {isAuthenticated ? "Employee Access" : "Employee Login"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {isAuthenticated ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800 font-medium">
                ✓ You are logged in as an employee
              </p>
              <p className="text-xs text-green-700 mt-1">
                You have access to edit making charges and discount settings.
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Enter the employee OTP to unlock premium features.
            </p>

            <div>
              <label className="block text-xs text-gray-600 uppercase tracking-wider font-medium mb-2">
                Enter OTP
              </label>
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setOtp(val);
                  setError("");
                }}
                placeholder="••••••"
                maxLength={6}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:border-amber-400 focus:ring-2 focus:ring-amber-200 font-medium text-center text-xl tracking-widest"
                autoFocus
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-xs text-red-700 font-medium">{error}</p>
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={isLoading || otp.length !== 6}
              className="w-full px-4 py-2.5 bg-linear-to-r from-amber-500 to-amber-600 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isLoading ? "Verifying..." : "Login"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
