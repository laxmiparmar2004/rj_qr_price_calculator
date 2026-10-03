import type { CustomerScheme } from "../../types/customerPortal";

interface SchemeSelectorProps {
  schemes: CustomerScheme[];
  selectedSchemeId: number | null;
  onSelect: (schemeId: number) => void;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const humanizeStatus = (status: string) => {
  if (!status) return "Ongoing";
  return status.charAt(0).toUpperCase() + status.slice(1);
};

export const SchemeSelector = ({
  schemes,
  selectedSchemeId,
  onSelect,
}: SchemeSelectorProps) => {
  const activeSchemes = schemes.filter(
    (scheme) => !["cancelled", "completed"].includes(scheme.status.toLowerCase())
  );
  const completedSchemes = schemes.filter((scheme) =>
    ["cancelled", "completed"].includes(scheme.status.toLowerCase())
  );

  const renderSchemeList = (items: CustomerScheme[], title: string) => {
    if (!items.length) return null;

    return (
      <div className="rounded-[24px] border border-stone-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-stone-400">
          {title}
        </p>
        <div className="space-y-3">
          {items.map((scheme) => {
            const isSelected = selectedSchemeId === scheme.id;
            const paidInstallments = scheme.installments.filter((item) =>
              ["paid", "completed"].includes(item.status.toLowerCase())
            ).length;

            return (
              <button
                key={scheme.id}
                type="button"
                onClick={() => onSelect(scheme.id)}
                className={`w-full rounded-2xl border p-3 text-left transition ${
                  isSelected
                    ? "border-[#d4b16f] bg-[#f9f1df] shadow-sm"
                    : "border-stone-200 bg-stone-50 hover:bg-stone-100"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-stone-800">
                      {scheme.scheme_title}
                    </p>
                    <p className="mt-1 text-xs text-stone-500">
                      {paidInstallments}/{scheme.installments.length} installments paid
                    </p>
                  </div>
                  <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-stone-500">
                    {humanizeStatus(scheme.status)}
                  </span>
                </div>
                <div className="mt-2 text-xs text-stone-500">
                  {currency(scheme.scheme_amount)} / month • Started {scheme.start_date || "—"}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {renderSchemeList(activeSchemes, "Active Schemes")}
      {renderSchemeList(completedSchemes, "Completed Schemes")}
    </div>
  );
};
