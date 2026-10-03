import type { CustomerScheme } from "../../types/customerPortal";

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const PaymentSummary = ({ scheme }: { scheme: CustomerScheme }) => {
  const installments = scheme.installments ?? [];
  const totalInstallments = installments.length;
  const paidInstallments = installments.filter((item) =>
    ["paid", "completed"].includes(item.status.toLowerCase())
  ).length;
  const totalPaid = installments.reduce(
    (sum, item) => sum + (item.amount_paid ?? 0),
    0
  );
  const remainingInstallments = Math.max(totalInstallments - paidInstallments, 0);
  const expectedContribution = scheme.scheme_amount * totalInstallments;
  const remainingBalance = Math.max(expectedContribution - totalPaid, 0);
  const bonusAmount = scheme.bonus?.amount ?? 0;

  return (
    <div className="rounded-[30px] border border-[#eadfc7] bg-white p-5 shadow-[0_18px_48px_rgba(58,42,19,0.06)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-stone-400">Payment summary</p>
          <h3 className="mt-2 text-xl font-semibold tracking-[-0.04em] text-stone-800">
            {scheme.scheme_title}
          </h3>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard label="Monthly contribution" value={formatCurrency(scheme.scheme_amount)} />
        <StatCard label="Amount paid" value={formatCurrency(totalPaid)} />
        <StatCard label="Installments paid" value={`${paidInstallments}`} />
        <StatCard label="Remaining installments" value={`${remainingInstallments}`} />
        <StatCard label="Expected contribution" value={formatCurrency(expectedContribution)} />
        <StatCard label="Scheme bonus" value={formatCurrency(bonusAmount)} />
        <StatCard
          label="Expected maturity"
          value={formatCurrency(expectedContribution + bonusAmount)}
        />
        <StatCard label="Remaining balance" value={formatCurrency(remainingBalance)} />
      </div>
    </div>
  );
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-2xl border border-stone-200 bg-[#faf8f4] p-4">
    <p className="text-[10px] uppercase tracking-[0.2em] text-stone-400">{label}</p>
    <p className="mt-2 text-lg font-semibold text-stone-800">{value}</p>
  </div>
);
