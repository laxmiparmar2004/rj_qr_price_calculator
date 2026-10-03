import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { verifyCustomerOtp } from "../../services/customerPortalService";
import type { CustomerSession } from "../../types/customerPortal";
import { RJLogo } from "../Brand/Logo";

interface CustomerLoginProps {
  onLogin: (customer: CustomerSession) => void;
}

const parsePhoneFromQuery = (params: URLSearchParams) => {
  const candidates = [
    "phone",
    "phoneNumber",
    "mobile",
    "customerPhone",
    "customer_phone",
  ];

  for (const candidate of candidates) {
    const value = params.get(candidate);
    if (value) return value;
  }

  return "";
};

const parseOtpFromQuery = (params: URLSearchParams) => {
  const candidates = ["otp", "customerOtp", "customer_otp", "code"];

  for (const candidate of candidates) {
    const value = params.get(candidate);
    if (value) return value;
  }

  return "";
};

export const CustomerLogin = ({ onLogin }: CustomerLoginProps) => {
  const [searchParams] = useSearchParams();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const urlPhone = parsePhoneFromQuery(searchParams);
    const urlOtp = parseOtpFromQuery(searchParams);

    if (urlPhone) {
      setPhone(urlPhone);
    }

    if (urlOtp) {
      setOtp(urlOtp);
    }
  }, [searchParams]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const normalizedPhone = phone.replace(/\D/g, "");
    if (!/^\d{10}$/.test(normalizedPhone)) {
      setError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!/^\d{4,6}$/.test(otp.trim())) {
      setError("Please enter a valid OTP.");
      return;
    }

    setLoading(true);

    try {
      const portalData = await verifyCustomerOtp(normalizedPhone, otp.trim());

      onLogin({
        phone: normalizedPhone,
        portalData,
      });
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Unable to verify OTP.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    setPhone(digits);
  };

  return (
    <div className="min-h-screen bg-[#f7f2ea] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-md">
        <div className="overflow-hidden rounded-[30px] border border-[#eadfc7] bg-white shadow-[0_20px_60px_rgba(58,42,19,0.08)]">
          <div className="bg-[linear-gradient(135deg,#f4ead1_0%,#e7d2a4_42%,#9f7d3a_100%)] px-6 pb-8 pt-8 text-[#20150f]">
            <div className="px-3 py-1">
              <RJLogo size="lg" className="w-50 mx-auto" />
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em]">
              Welcome back
            </h1>
            <p className="mt-2 text-sm text-[#49351a]">
              View your jewellery savings scheme, installment history, and upcoming dues.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5 px-6 py-6">
            <div>
              <label
                htmlFor="customer-phone"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                Phone number
              </label>
              <input
                id="customer-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                value={phone}
                onChange={(event) => handlePhoneChange(event.target.value)}
                placeholder="9876543210"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-800 outline-none transition focus:border-[#b7903c] focus:bg-white focus:ring-4 focus:ring-[#f3e5bd]"
                aria-invalid={Boolean(error)}
              />
            </div>

            <div>
              <label
                htmlFor="customer-otp"
                className="mb-2 block text-sm font-medium text-stone-700"
              >
                OTP
              </label>
              <input
                id="customer-otp"
                name="otp"
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={(event) =>
                  setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                placeholder="123456"
                className="w-full rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3 text-base text-stone-800 outline-none transition focus:border-[#b7903c] focus:bg-white focus:ring-4 focus:ring-[#f3e5bd]"
                aria-invalid={Boolean(error)}
              />
            </div>

            {error ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center rounded-2xl bg-[#1c1b19] px-4 py-3 text-base font-semibold text-white transition hover:bg-[#2c2926] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Verifying…" : "Verify & continue"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
