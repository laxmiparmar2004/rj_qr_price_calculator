import { useState } from "react";
import {
  CheckCircle2,
  Copy,
  MessageCircle,
  QrCode,
  ShieldCheck,
  Wallet,
  X,
} from "lucide-react";

import PayNowButton from "./PayNowButton";

interface InstallmentPaymentProps {
  userSchemeId: number;
  installmentNumber: number;
  amount: number;
  dueDate: string;
  customerName: string;
  whatsappNumber: string;
  qrImageUrl: string;
}

export default function InstallmentPayment({
  userSchemeId,
  installmentNumber,
  amount,
  dueDate,
  customerName,
  whatsappNumber,
  qrImageUrl,
}: InstallmentPaymentProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState("");

  const formattedAmount = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);

  const message = `Hello Shree Roopkamal Jewelers,

I have made my Gold Bachat Scheme installment payment.

Customer Name: ${customerName}
Installment: ${installmentNumber}
Amount Paid: ₹${amount}
Refernce id: ${userSchemeId}

I am sharing the payment screenshot for verification.

Please confirm my payment.

Thank you.`;

  const phone = whatsappNumber.replace(/\D/g, "");
  const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  const canSendWhatsApp = phone.length >= 10;

  const copyMessage = async () => {
    setCopyError("");
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Unable to copy the WhatsApp payment message.", error);
      setCopyError("Could not copy the message. Please copy it manually.");
    }
  };

  return (
    <>
      <PayNowButton onClick={() => setIsOpen(true)} />

      {isOpen && (
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="installment-payment-title"
            className="relative flex max-h-[calc(100dvh-1rem)] w-full max-w-lg flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="shrink-0 border-b border-[#EDE2CD] bg-[#FBF8F1] px-4 py-3 sm:px-5">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="absolute right-3 top-3 rounded-full p-1.5 text-gray-500 transition hover:bg-[#EEE5D5]"
                aria-label="Close payment dialog"
              >
                <X size={19} />
              </button>

              <div className="mb-1 flex items-center gap-2">
                <div className="rounded-lg bg-[#EAD9B6] p-1.5">
                  <Wallet size={17} className="text-[#94702C]" />
                </div>
                <span className="text-sm font-semibold text-[#94702C]">
                  SHREE ROOPKAMAL JEWELERS
                </span>
              </div>

              <h2
                id="installment-payment-title"
                className="text-lg font-bold text-gray-900"
              >
                Complete Your Payment
              </h2>
              <p className="text-xs text-gray-500">
                Gold Bachat Scheme · Installment {installmentNumber}
              </p>
            </div>

            <div className="min-h-0 space-y-3 overflow-hidden p-3 sm:p-4">
              <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
                <div className="rounded-xl border border-[#E9D9B9] bg-[#FBF8F1] p-3 text-center">
                  <p className="text-[10px] font-medium tracking-wider text-gray-500">
                    TOTAL AMOUNT TO PAY
                  </p>
                  <h3 className="mt-1 text-2xl font-bold text-[#A47B32]">
                    {formattedAmount}
                  </h3>
                  <p className="mt-1 text-[11px] text-gray-500">
                    Installment {installmentNumber} · Due {dueDate}
                  </p>
                </div>

                <div className="text-center">
                  <h3 className="mb-1 text-xs font-semibold text-gray-900">
                    Scan &amp; Pay
                  </h3>
                  <div className="mx-auto flex h-[clamp(6rem,44dvh,24rem)] w-[clamp(6rem,24dvh,34rem)] items-center justify-center rounded-xl border-2 border-dashed border-[#DDC99F] bg-white p-1.5">
                  {qrImageUrl ? (
                    <img
                      src={qrImageUrl}
                      alt="Shree Roopkamal Jewelers UPI QR Code"
                      className="h-full w-full object-contain"
                    />
                  ) : (
                    <div className="text-center text-gray-400">
                      <QrCode size={32} className="mx-auto mb-1" />
                      <p className="text-[10px]">QR not configured</p>
                    </div>
                  )}
                  </div>

                  <div className="mt-1 flex items-center justify-center gap-1">
                    <ShieldCheck size={14} className="shrink-0 text-green-600" />
                    <span className="text-[10px] font-semibold text-gray-800">
                    Shree Roopkamal Jewelers
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-green-100 bg-green-50 p-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className="text-green-600" size={17} />
                  <h3 className="text-sm font-semibold text-gray-900">
                    Payment completed?
                  </h3>
                </div>

                <p className="mt-1 text-xs leading-relaxed text-gray-600">
                  Send a screenshot of your successful payment on WhatsApp for
                  verification.
                </p>

                <button
                  type="button"
                  disabled={!canSendWhatsApp}
                  onClick={() =>
                    window.open(whatsappUrl, "_blank", "noopener,noreferrer")
                  }
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-[#16834A] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#126B3C] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <MessageCircle size={16} />
                  Send Payment Screenshot on WhatsApp
                </button>
                {!canSendWhatsApp && (
                  <p className="mt-1 text-[11px] text-red-700" role="status">
                    WhatsApp contact is not configured.
                  </p>
                )}

                <button
                  type="button"
                  onClick={copyMessage}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg py-1.5 text-[11px] font-medium text-gray-600 hover:bg-green-100"
                >
                  {copied ? (
                    <CheckCircle2 size={14} />
                  ) : (
                    <Copy size={14} />
                  )}
                  {copied ? "Message Copied!" : "Copy WhatsApp Message"}
                </button>
                {copyError && (
                  <p className="mt-1 text-center text-[11px] text-red-700" role="alert">
                    {copyError}
                  </p>
                )}
              </div>

              <div className="flex items-start gap-2 text-[11px] leading-relaxed text-gray-500">
                <ShieldCheck size={14} className="mt-0.5 shrink-0" />
                <p>
                  Your installment will be marked as paid only after our team
                  verifies your payment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
