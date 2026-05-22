// Authentication utilities for employee access with dynamic date-based OTP

const AUTH_COOKIE_NAME = "rj_employee_auth";
const AUTH_COOKIE_EXPIRY_DAYS = 30;

// Generate OTP based on current date format: DDMMYY
// For example: 22 May 2026 → 220426
export const generateDynamicOTP = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const year = String(today.getFullYear()).slice(-2);
  return `${day}${month}${year}`;
};

// Get OTP format hint for users
export const getOTPFormatHint = (): string => {
  const today = new Date();
  const day = String(today.getDate()).padStart(2, "0");
  const month = today.toLocaleDateString("en-IN", { month: "short" });
  const year = today.getFullYear();
  return `${day} ${month} ${year}`;
};

// Set authentication cookie
export const setAuthCookie = (otp: string): boolean => {
  const correctOTP = generateDynamicOTP();
  if (otp === correctOTP) {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + AUTH_COOKIE_EXPIRY_DAYS);

    document.cookie = `${AUTH_COOKIE_NAME}=true; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    return true;
  }
  return false;
};

// Check if user is authenticated as employee
export const isEmployeeAuthenticated = (): boolean => {
  const cookies = document.cookie.split(";");
  return cookies.some((cookie) =>
    cookie.trim().startsWith(`${AUTH_COOKIE_NAME}=true`),
  );
};

// Clear authentication cookie (logout)
export const clearAuthCookie = (): void => {
  document.cookie = `${AUTH_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
};

// Get auth status and credentials info
export const getAuthStatus = () => {
  return {
    isAuthenticated: isEmployeeAuthenticated(),
    canEditMakingCharges: isEmployeeAuthenticated(),
  };
};
