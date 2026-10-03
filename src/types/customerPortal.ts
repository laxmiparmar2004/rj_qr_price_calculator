export type SchemeStatus =
  | "ongoing"
  | "active"
  | "completed"
  | "paused"
  | "cancelled";

export type InstallmentStatus =
  | "paid"
  | "partial"
  | "pending"
  | "overdue"
  | "upcoming"
  | "completed"
  | "bonus"
  | "approved"
  | "redeemed";

export interface CustomerPortalResponse {
  customer_name: string;
  schemes: CustomerScheme[];
}

export interface CustomerSession {
  phone: string;
  portalData: CustomerPortalResponse;
}

export interface SchemeBonus {
  date: string;
  amount: number;
  approved: boolean | null;
  redeemed: boolean;
  redeem_date: string | null;
}

export interface SchemeInstallment {
  number: number;
  status: string;
  due_date: string;
  late_fee: number;
  paid_date: string | null;
  amount_due: number;
  amount_paid: number | null;
}

export interface CustomerScheme {
  id: number;
  local_user_scheme_id: number;
  scheme_title: string;
  scheme_amount: number;
  status: string;
  start_date: string;
  end_date: string;
  synced_at: string;
  installments: SchemeInstallment[];
  bonus: SchemeBonus | null;
}
