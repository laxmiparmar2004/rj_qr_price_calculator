import { Check, Gift } from "lucide-react";
import type { CustomerScheme } from "../../types/customerPortal";

const currency = (value: number) =>
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

export const InstallmentTable = ({ scheme }: { scheme: CustomerScheme }) => {
  const rows = [...scheme.installments];

  if (scheme.bonus) {
    rows.push({
      number: 999,
      status: scheme.bonus.redeemed
        ? "redeemed"
        : scheme.bonus.approved
          ? "approved"
          : "bonus",
      due_date: scheme.bonus.date,
      late_fee: 0,
      paid_date: scheme.bonus.redeem_date,
      amount_due: 0,
      amount_paid: scheme.bonus.redeemed ? scheme.bonus.amount : null,
    });
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-[#d9c7a0] bg-white shadow-[0_8px_24px_rgba(58,42,19,0.08)]">

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#eadfc7] bg-[#fbf7ee] px-4 py-4 sm:px-5">
        <div>
          <h3 className="font-semibold text-stone-900">
            Gold Bachat Passbook
          </h3>

          <p className="mt-0.5 text-xs text-stone-500">
            Your monthly payment record
          </p>
        </div>

        <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-500 ring-1 ring-[#e5d8bc]">
          {scheme.installments.length} months
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">

          <thead>
            <tr className="border-b-2 border-[#d9c7a0] text-xs text-stone-500">
              <th className="px-4 py-3 font-medium sm:px-5">
                Installment
              </th>

              <th className="px-3 py-3 font-medium">
                Due date
              </th>

              <th className="px-3 py-3 text-right font-medium">
                Amount
              </th>

              <th className="px-3 py-3 font-medium">
                Paid on
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => {
              const isBonus = row.number === 999;

              const status = isBonus
                ? scheme.bonus?.redeemed
                  ? "redeemed"
                  : scheme.bonus?.approved
                    ? "approved"
                    : "bonus"
                : (row.status || "pending").toLowerCase();

              const isPaid = isBonus
                ? status === "redeemed"
                : status === "paid";

              /*
               * BONUS ROW
               */
              if (isBonus) {
                return (
                  <tr
                    key="bonus"
                    className="border-t border-[#e2c987] bg-[#fff7df]"
                  >
                    <td className="px-4 py-4 sm:px-5">
                      <div className="flex items-center gap-3">

                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#efe0b5]">
                          <Gift className="h-4 w-4 text-[#8B6914]" />
                        </div>

                        <div>
                          <p className="font-semibold text-stone-900">
                            Jeweller Bonus
                          </p>

                          <p className="mt-0.5 text-[11px] text-stone-500">
                            Paid by Roopkamal Jewellers
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-stone-600">
                      {formatDate(row.due_date)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-right font-semibold text-[#8B6914]">
                      + {currency(scheme.bonus?.amount ?? 0)}
                    </td>

                    <td className="whitespace-nowrap px-3 py-4 text-stone-600">
                      {formatDate(row.paid_date)}
                    </td>
                  </tr>
                );
              }

              /*
               * NORMAL INSTALLMENT
               */
              return (
                <tr
                  key={`${row.number}-${index}`}
                  className={`border-b border-dashed border-stone-200 last:border-b-0 ${
                    isPaid
                      ? "bg-emerald-500/[0.07]"
                      : index % 2
                        ? "bg-[#fdfbf7]"
                        : "bg-white"
                  }`}
                >
                  <td
                    className={`px-4 py-3.5 sm:px-5 ${
                      isPaid
                        ? "shadow-[inset_3px_0_0_#10b981]"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-2.5">

                      {isPaid ? (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                          <Check
                            className="h-3.5 w-3.5"
                            strokeWidth={3}
                          />
                        </span>
                      ) : (
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[11px] font-semibold text-stone-500">
                          {row.number}
                        </span>
                      )}

                      <div>
                        <span className="font-semibold text-stone-800">
                          Installment {row.number}
                        </span>

                        {isPaid && (
                          <span className="ml-2 text-[11px] font-medium text-emerald-600">
                            Paid
                          </span>
                        )}
                      </div>

                    </div>
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-stone-600">
                    {formatDate(row.due_date)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-right font-medium tabular-nums text-stone-800">
                    {currency(scheme.scheme_amount)}
                  </td>

                  <td className="whitespace-nowrap px-3 py-3.5 text-stone-600">
                    {formatDate(row.paid_date)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};