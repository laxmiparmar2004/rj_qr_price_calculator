import {
  CalendarCheck,
  Gift,
  Gem,
  Info,
  ChevronRight,
} from "lucide-react";

interface ImportantSchemeTermsProps {
  bonusAmount: number;
  onShowTerms: () => void;
}

const currency = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

export const ImportantSchemeTerms = ({
  bonusAmount,
  onShowTerms,
}: ImportantSchemeTermsProps) => {
  return (
    <div className="rounded-2xl border border-[#d9c7a0] bg-white p-4 shadow-[0_8px_24px_rgba(58,42,19,0.06)] sm:p-5">

      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-stone-900">
            Important to know
          </h3>
          <p className="mt-0.5 text-xs text-stone-500">
            Key rules of your Gold Bachat Scheme
          </p>
        </div>

        <Info className="h-5 w-5 text-[#9b782d]" />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">

        <Term
          icon={<CalendarCheck className="h-4 w-4" />}
          title="Pay on time"
          description="Pay every monthly installment by its due date to remain eligible for the bonus."
        />

        <Term
          icon={<Gift className="h-4 w-4" />}
          title={`${currency(bonusAmount)} Bonus`}
          description="Complete all 11 installments and Roopkamal Jewellers contributes the bonus."
        />

        <Term
          icon={<Gem className="h-4 w-4" />}
          title="Gold jewellery only"
          description="Your maturity amount can be redeemed towards purchase of gold jewellery."
        />

      </div>

      <button
        type="button"
        onClick={onShowTerms}
        className="mt-4 flex w-full items-center justify-between rounded-xl bg-[#fbf7ee] px-4 py-3 text-left transition hover:bg-[#f7efdf]"
      >
        <div className="flex items-center gap-3">
          <Info className="h-4 w-4 text-[#8B6914]" />

          <div>
            <p className="text-sm font-medium text-stone-800">
              Terms & Conditions
            </p>

            <p className="text-xs text-stone-500">
              Read bonus, redemption and cancellation rules
            </p>
          </div>
        </div>

        <ChevronRight className="h-4 w-4 text-stone-400" />
      </button>
    </div>
  );
};

const Term = ({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) => (
  <div className="rounded-xl border border-[#eee4cf] bg-[#fdfbf7] p-3">
    <div className="mb-2 flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f2e6ca] text-[#8B6914]">
        {icon}
      </span>

      <span className="text-sm font-semibold text-stone-800">
        {title}
      </span>
    </div>

    <p className="text-xs leading-5 text-stone-500">
      {description}
    </p>
  </div>
);