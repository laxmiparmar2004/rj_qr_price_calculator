import type { CustomerScheme } from "../../types/customerPortal";
import { SchemeProgress } from "./SchemeProgress";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const formatDate = (value?: string | null) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const humanizeStatus = (status: string) => {
  if (!status) return "Ongoing";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

const getSchemeMetrics = (scheme: CustomerScheme) => {
  const installments = scheme.installments ?? [];
  const totalInstallments = installments.length;
  const paidInstallments = installments.filter((item) =>
    ["paid", "completed"].includes(item.status.toLowerCase())
  ).length;
  const totalPaid = installments.reduce(
    (sum, item) => sum + (item.amount_paid ?? 0),
    0
  );
  const nextInstallment =
    installments.find((item) =>
      ["pending", "upcoming", "overdue"].includes(item.status.toLowerCase())
    ) ?? null;

  return {
    totalInstallments,
    paidInstallments,
    remainingInstallments: Math.max(totalInstallments - paidInstallments, 0),
    totalPaid,
    nextInstallment,
    progress:
      totalInstallments > 0
        ? Math.min((paidInstallments / totalInstallments) * 100, 100)
        : 0,
  };
};

const schemeStatusClasses: Record<string, string> = {
  ongoing: "bg-emerald-100 text-emerald-700",
  active: "bg-emerald-100 text-emerald-700",
  completed: "bg-blue-100 text-blue-700",
  paused: "bg-amber-100 text-amber-700",
  cancelled: "bg-red-100 text-red-700",
};

export const SchemeSummaryCard = ({ scheme }: { scheme: CustomerScheme }) => {
  const metrics = getSchemeMetrics(scheme);
  const schemeStatus = scheme.status.toLowerCase();

  return (
    <div className="rounded-[30px] border border-[#eadfc7] bg-white p-5 shadow-[0_18px_48px_rgba(58,42,19,0.06)] sm:p-6">
      <div className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Scheme overview</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-stone-800">
            {scheme.scheme_title}
          </h2>
        </div>

        <span
          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.15em] ${
            schemeStatusClasses[schemeStatus] ?? "bg-stone-100 text-stone-700"
          }`}
        >
          {humanizeStatus(scheme.status)}
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Metric label="Start date" value={formatDate(scheme.start_date)} />
        <Metric label="Expected completion" value={formatDate(scheme.end_date)} />
        <Metric label="Monthly amount" value={formatCurrency(scheme.scheme_amount)} />
        <Metric label="Total paid" value={formatCurrency(metrics.totalPaid)} />
      </div>

      <div className="mt-6 rounded-2xl bg-[#faf8f4] p-4">
        <div className="mb-3 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Progress</p>
            <p className="mt-1 text-lg font-semibold text-stone-800">
              {metrics.paidInstallments} of {metrics.totalInstallments} installments completed
            </p>
          </div>
          <div className="rounded-full bg-[#f3ead6] px-3 py-1 text-sm font-semibold text-[#8a6730]">
            {Math.round(metrics.progress)}%
          </div>
        </div>
        <SchemeProgress
          current={metrics.paidInstallments}
          total={metrics.totalInstallments}
          label="Installments"
        />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <DetailCard label="Paid installments" value={String(metrics.paidInstallments)} />
        <DetailCard label="Remaining" value={String(metrics.remainingInstallments)} />
        <DetailCard
          label="Next due"
          value={metrics.nextInstallment ? formatDate(metrics.nextInstallment.due_date) : "—"}
        />
      </div>
    </div>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
    <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">{label}</p>
    <p className="mt-2 text-base font-semibold text-stone-800">{value}</p>
  </div>
);

const DetailCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-stone-200 bg-white p-4">
    <p className="text-[10px] uppercase tracking-[0.22em] text-stone-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-stone-800">{value}</p>
  </div>
);
