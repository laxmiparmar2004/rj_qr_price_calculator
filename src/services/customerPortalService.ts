import { supabase } from "../supabase/client";
import type {
  CustomerPortalResponse,
  CustomerScheme,
  SchemeBonus,
  SchemeInstallment,
} from "../types/customerPortal";

const toNumber = (value: unknown, fallback = 0): number => {
  if (value === null || value === undefined || value === "") {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStringValue = (value: unknown, fallback = ""): string => {
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return fallback;
};

const normalizePhoneNumber = (phoneNumber: string): string => {
  const digits = phoneNumber.replace(/\D/g, "");
  if (digits.length === 10) return digits;
  if (digits.length > 10 && digits.startsWith("91")) return digits.slice(2);
  return digits;
};

const normalizeStatus = (value: unknown, fallback = "pending"): string => {
  const status = toStringValue(value, fallback).toLowerCase();
  return status || fallback;
};

const normalizeInstallment = (row: Record<string, unknown>): SchemeInstallment => {
  const amountPaid = row.amount_paid ?? row.paid_amount ?? row.paidAmount ?? null;
  const amountDue = row.amount_due ?? row.amountDue ?? row.expected_amount ?? row.expectedAmount ?? 0;
  const rawPaidDate =
    row.paid_date ?? row.paidDate ?? row.payment_date ?? row.paymentDate ?? null;

  return {
    number: toNumber(row.number ?? row.installment_number ?? row.installmentNumber, 0),
    status: normalizeStatus(row.status, "pending"),
    due_date: toStringValue(row.due_date ?? row.dueDate ?? row.expected_date ?? "", ""),
    late_fee: toNumber(row.late_fee ?? row.lateFee, 0),
    paid_date: typeof rawPaidDate === "string" ? rawPaidDate : null,
    amount_due: toNumber(amountDue, 0),
    amount_paid: amountPaid === null ? null : toNumber(amountPaid, 0),
  };
};

const normalizeBonus = (bonus: unknown): SchemeBonus | null => {
  if (!bonus || typeof bonus !== "object") {
    return null;
  }

  const value = bonus as Record<string, unknown>;
  const rawRedeemDate = value.redeem_date ?? value.redeemDate ?? null;

  return {
    date: toStringValue(value.date ?? value.eligible_date ?? value.eligibleDate ?? "", ""),
    amount: toNumber(value.amount ?? value.value ?? 0, 0),
    approved:
      value.approved === null || value.approved === undefined
        ? null
        : Boolean(value.approved),
    redeemed: Boolean(value.redeemed ?? false),
    redeem_date: typeof rawRedeemDate === "string" ? rawRedeemDate : null,
  };
};

const normalizeScheme = (row: Record<string, unknown>): CustomerScheme => {
  const installments = Array.isArray(row.installments)
    ? row.installments.map((item) => normalizeInstallment(item as Record<string, unknown>))
    : [];

  return {
    id: toNumber(row.id ?? row.scheme_id ?? row.local_user_scheme_id ?? row.localUserSchemeId, 0),
    local_user_scheme_id: toNumber(
      row.local_user_scheme_id ?? row.localUserSchemeId ?? row.id ?? 0,
      0
    ),
    scheme_title: toStringValue(
      row.scheme_title ?? row.schemeTitle ?? row.scheme_name ?? row.schemeName ?? "Jewellery Scheme",
      "Jewellery Scheme"
    ),
    scheme_amount: toNumber(
      row.scheme_amount ?? row.schemeAmount ?? row.monthly_amount ?? row.monthlyAmount ?? 0,
      0
    ),
    status: normalizeStatus(row.status, "ongoing"),
    start_date: toStringValue(row.start_date ?? row.startDate ?? "", ""),
    end_date: toStringValue(row.end_date ?? row.endDate ?? "", ""),
    synced_at: toStringValue(row.synced_at ?? row.syncedAt ?? "", ""),
    installments,
    bonus: normalizeBonus(row.bonus),
  };
};

const normalizePortalResponse = (data: unknown): CustomerPortalResponse | null => {
  if (!data) {
    return null;
  }

  const payload = (Array.isArray(data) ? data[0] : data) as Record<string, unknown> | null;
  if (!payload || typeof payload !== "object") {
    return null;
  }

  const schemesRaw = Array.isArray(payload.schemes)
    ? payload.schemes
    : Array.isArray(payload.customer_schemes)
      ? payload.customer_schemes
      : [];

  const normalizedCustomerName = toStringValue(
    payload.customer_name ?? payload.customerName ?? payload.name ?? "Customer",
    "Customer"
  );

  return {
    customer_name: normalizedCustomerName,
    schemes: schemesRaw.map((entry) => normalizeScheme(entry as Record<string, unknown>)),
  };
};

const fallbackPortalResponse = (phoneNumber: string, otp: string): CustomerPortalResponse | null => {
  if (import.meta.env.DEV && phoneNumber === "9876543210" && otp === "123456") {
    return {
      customer_name: "Aarav Mehta",
      schemes: [
        {
          id: 3,
          local_user_scheme_id: 7,
          scheme_title: "Swarn Bachat Yojana",
          scheme_amount: 500,
          status: "ongoing",
          start_date: "2026-09-22",
          end_date: "2027-08-22",
          synced_at: "2026-10-01T14:03:00.231+00:00",
          installments: [
            {
              number: 1,
              status: "paid",
              due_date: "2026-09-22",
              late_fee: 0,
              paid_date: "2026-10-01T14:02:09.034Z",
              amount_due: 0,
              amount_paid: 500,
            },
            {
              number: 2,
              status: "pending",
              due_date: "2026-11-01",
              late_fee: 0,
              paid_date: null,
              amount_due: 500,
              amount_paid: null,
            },
          ],
          bonus: {
            date: "2027-09-01",
            amount: 500,
            approved: null,
            redeemed: false,
            redeem_date: null,
          },
        },
      ],
    };
  }

  return null;
};

export const verifyCustomerOtp = async (
  phoneNumber: string,
  otp: string
): Promise<CustomerPortalResponse> => {
  const normalizedPhone = normalizePhoneNumber(phoneNumber);

  if (!normalizedPhone || normalizedPhone.length !== 10) {
    throw new Error("Please enter a valid 10-digit Indian mobile number.");
  }

  if (!/^\d{4,6}$/.test(otp.trim())) {
    throw new Error("Please enter a valid OTP.");
  }

  const rpcCandidates = [
    "verify_customer_portal_otp"
  ];

  if (supabase && typeof (supabase as { rpc?: unknown }).rpc === "function") {
    for (const rpcName of rpcCandidates) {
      try {
        const { data, error } = await supabase.rpc(rpcName, {
          p_phone: normalizedPhone,
          p_otp: otp.trim(),
        });

        if (error) {
          const message = String(error.message ?? "");
          if (!/does not exist|function.*not found|not found/i.test(message)) {
            throw new Error(message || "Unable to verify OTP.");
          }
          continue;
        }

        const normalized = normalizePortalResponse(data);
        if (normalized) {
          return normalized;
        }

        throw new Error("Invalid OTP or customer not found.");
      } catch (error) {
        if (error instanceof Error && /does not exist|function.*not found|not found|Invalid OTP or customer not found/i.test(error.message)) {
          continue;
        }
        if (error instanceof Error) {
          throw error;
        }
        continue;
      }
    }
  }

  const fallback = fallbackPortalResponse(normalizedPhone, otp.trim());
  if (fallback) {
    return fallback;
  }

  throw new Error("Invalid OTP or customer not found.");
};

export const getCustomerPortalData = async (
  _customerId: number
): Promise<CustomerPortalResponse> => {
  throw new Error(
    "Customer portal data is already returned by the OTP verification RPC. No extra fetch should be made here."
  );
};
