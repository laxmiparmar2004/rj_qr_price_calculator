import { Check, Gift } from "lucide-react";
import type { CustomerScheme } from "../../types/customerPortal";
import InstallmentPayment from "./InstallmentPayment";

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
    year: "2-digit",
  });
};

export const InstallmentTable = ({
  scheme,
  customerName,
}: {
  scheme: CustomerScheme;
  customerName: string;
}) => {
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

      <div className="w-full overflow-x-hidden">
        <table className="w-full table-fixed border-collapse text-left text-[10px] sm:text-sm">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[24%]" />
            <col className="w-[18%]" />
            <col className="w-[24%]" />
          </colgroup>

          <thead>
            <tr className="border-b-2 border-[#d9c7a0] text-xs text-stone-500">
              <th className="px-1.5 py-2 font-medium text-[9px] sm:px-5 sm:py-3 sm:text-xs">
                Installment
              </th>

              <th className="px-1 py-2 font-medium text-[9px] sm:px-3 sm:py-3 sm:text-xs">
                Due date
              </th>

              <th className="px-1 py-2 text-right font-medium text-[9px] sm:px-3 sm:py-3 sm:text-xs">
                Amount
              </th>

              <th className="px-1 py-2 font-medium text-[9px] sm:px-3 sm:py-3 sm:text-xs">
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

              const isToBePaid = !isPaid && rows[index - 1]?.status?.toLowerCase() === "paid";

              /*
               * BONUS ROW
               */
              if (isBonus) {
                return (
                  <tr
                    key="bonus"
                    className="border-t border-[#e2c987] "
                  >
                    <td className="break-words px-1.5 py-3 sm:px-5 sm:py-4">
                      <div className="flex items-center gap-1.5 sm:gap-3">

                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#efe0b5] sm:h-8 sm:w-8">
                          <Gift className="h-3 w-3 text-[#8B6914] sm:h-4 sm:w-4" />
                        </div>

                        <div>
                          <p className="text-[10px] font-semibold leading-tight text-stone-900 sm:text-sm">
                            Jeweller Bonus
                          </p>

                          <p className="mt-0.5 text-[9px] leading-tight text-stone-500 sm:text-[11px]">
                            Paid by Roopkamal Jewellers
                          </p>
                        </div>

                      </div>
                    </td>

                    <td className="whitespace-nowrap px-1 py-3 text-[9px] text-stone-600 sm:px-3 sm:py-4 sm:text-sm">
                      {formatDate(row.due_date)}
                    </td>

                    <td className="whitespace-nowrap px-1 py-3 text-right text-[9px] font-semibold text-[#8B6914] sm:px-3 sm:py-4 sm:text-sm">
                      + {currency(scheme.bonus?.amount ?? 0)}
                    </td>

                    <td className="whitespace-nowrap px-1 py-3 text-[9px] text-stone-600 sm:px-3 sm:py-4 sm:text-sm">
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
                      : "bg-white"
                  }`}
                >
                  <td
                    className={`px-1.5 py-3 sm:px-5 sm:py-3.5 ${
                      isPaid
                        ? "shadow-[inset_3px_0_0_#10b981]"
                        : ""
                    }`}
                  >
                    <div className="flex min-w-0 items-center gap-1 sm:gap-2.5">

                      {isPaid ? (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white sm:h-6 sm:w-6">
                          <Check
                            className="h-3 w-3 sm:h-3.5 sm:w-3.5"
                            strokeWidth={3}
                          />
                        </span>
                      ) : (
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-stone-200 bg-white text-[9px] font-semibold text-stone-500 sm:h-6 sm:w-6 sm:text-[11px]">
                          {row.number}
                        </span>
                      )}

                      <div className="min-w-0">
                        <span className="font-semibold leading-tight text-stone-800">
                          Installment {row.number}
                        </span>

                        {isPaid && (
                          <span className="ml-1 text-[9px] font-medium text-emerald-600 sm:ml-2 sm:text-[11px]">
                            Paid
                          </span>
                        )}
                      </div>

                    </div>
                  </td>

                  <td className="whitespace-nowrap px-1 py-3 text-[9px] text-stone-600 sm:px-3 sm:py-3.5 sm:text-sm">
                    {formatDate(row.due_date)}
                  </td>

                  <td className="whitespace-nowrap px-1 py-3 text-right text-[10px] font-medium tabular-nums text-stone-800 sm:px-3 sm:py-3.5 sm:text-sm">
                    {currency(scheme.scheme_amount)}
                  </td>

                  <td className="whitespace-nowrap px-1 py-3 text-[9px] text-stone-600 sm:px-3 sm:py-3.5 sm:text-sm">
                    {!isPaid && !isToBePaid && (
                      <span className="rounded-full bg-yellow-100 px-2 py-0.5 text-[9px] font-medium text-yellow-800 sm:text-[11px]">
                        Pending
                      </span>
                    )}
                    {
                      isToBePaid && (
                        <div className="mt-2">
                          <InstallmentPayment
                            userSchemeId={scheme?.local_user_scheme_id}
                            installmentNumber={row.number}
                            amount={row.amount_due || scheme.scheme_amount}
                            dueDate={formatDate(row.due_date)}
                            customerName={customerName}
                            whatsappNumber={import.meta.env.VITE_SHOP_WHATSAPP_NUMBER ?? ""}
                            qrImageUrl={import.meta.env.VITE_UPI_QR_IMAGE_URL ?? ""}
                          />
                        </div>
                      )
                    }
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