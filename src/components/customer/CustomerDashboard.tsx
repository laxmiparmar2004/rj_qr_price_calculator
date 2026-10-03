import { useEffect, useMemo, useState } from "react";

import type { CustomerScheme, CustomerSession } from "../../types/customerPortal";
import { InstallmentTable } from "./InstallmentTable";
import { ImportantSchemeTerms } from "./t&c/ImportantSchemeTerms";
import { TermsModal } from "./t&c/TermsModal";
import { RJLogo } from "../Brand/Logo";
import { SchemeSummaryCard } from "./SchemeSummaryCard";
import { PaymentSummary } from "./PaymentSummary";
import { EmptyState } from "./EmptyState";

interface CustomerDashboardProps {
  customer: CustomerSession;
  onLogout: () => void;
}

const getDefaultScheme = (schemes: CustomerScheme[]) => {
  const byStatus = (status: string) =>
    schemes.find((scheme) => scheme.status.toLowerCase() === status);

  return byStatus("ongoing") ?? byStatus("active") ?? schemes[0] ?? null;
};

// One line on the card: "Name ______" with the value sitting on the rule
const CardField = ({ label, value }: { label: string; value: string }) => (
  <div className="flex min-w-0 flex-1 items-baseline gap-2">
    <span className="shrink-0 text-xs text-stone-400">{label}</span>
    <span className="min-w-0 flex-1 truncate border-b border-dashed border-stone-300 pb-0.5 text-sm font-semibold text-stone-800">
      {value}
    </span>
  </div>
);

const CardHeader = ({
  name,
  phone,
  onLogout,
}: {
  name: string;
  phone: string;
  onLogout: () => void;
}) => (
  <div className="overflow-hidden rounded-2xl border border-[#d9c7a0] bg-white shadow-[0_8px_24px_rgba(58,42,19,0.08)]">
    {/* Gold edge, like the border of a printed card */}
    <div className="h-1.5 bg-gradient-to-r from-[#8B6914] via-[#C9A24B] to-[#8B6914]" />

    <div className="space-y-3 px-4 py-3 sm:px-5">
      <div className="flex items-center justify-between gap-3">
        <RJLogo size="lg" className="w-28" />
        <button
          type="button"
          onClick={onLogout}
          className="rounded-full border border-stone-200 bg-stone-50 px-3.5 py-1.5 text-xs font-medium text-stone-700 transition hover:bg-stone-100"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
        <CardField label="Name" value={name} />
        <CardField label="Phone" value={phone} />
      </div>
    </div>
  </div>
);

export const CustomerDashboard = ({
  customer,
  onLogout,
}: CustomerDashboardProps) => {
  const schemes = useMemo(() => customer.portalData.schemes ?? [], [customer.portalData]);
  const [selectedSchemeId, setSelectedSchemeId] = useState<number | null>(null);
   const [showTerms, setShowTerms] = useState(false);
  
   useEffect(() => {
    const nextDefault = getDefaultScheme(schemes);
    if (!nextDefault) {
      setSelectedSchemeId(null);
      return;
    }

    setSelectedSchemeId((current) =>
      current && schemes.some((scheme) => scheme.id === current)
        ? current
        : nextDefault.id,
    );
  }, [schemes]);

  const selectedScheme =
    schemes.find((scheme) => scheme.id === selectedSchemeId) ?? getDefaultScheme(schemes);

  const header = (
    <CardHeader
      name={customer.portalData.customer_name}
      phone={customer.phone.replace(/(\d{2})(\d{5})(\d{3})/, "$1*****$3")}
      onLogout={onLogout}
    />
  );

  return (
    <div className="min-h-screen bg-[#f7f2ea] px-3 py-4 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-4">
        {header}

        {!schemes.length ? (
  <EmptyState
    title="No active schemes found"
    description="You are currently not enrolled in any active jewellery savings scheme."
  />
) : selectedScheme ? (
  <>
    <InstallmentTable scheme={selectedScheme} />
    
    <ImportantSchemeTerms
      bonusAmount={selectedScheme.bonus?.amount ?? 0}
      onShowTerms={() => setShowTerms(true)}
    />

    <SchemeSummaryCard scheme={selectedScheme} />

    <PaymentSummary scheme={selectedScheme} />


    <TermsModal
      open={showTerms}
      onClose={() => setShowTerms(false)}
    />
  </>
) : null}
      </div>
    </div>
  );
};