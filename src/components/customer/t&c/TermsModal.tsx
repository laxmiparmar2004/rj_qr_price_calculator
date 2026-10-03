import { X, Gift, CircleAlert } from "lucide-react";

interface TermsModalProps {
  open: boolean;
  onClose: () => void;
}

const terms = [
  <>
    The scheme consists of <strong>11 monthly installments</strong>.
    After successful completion, Roopkamal Jewellers contributes the
    12th month amount as a bonus.
  </>,

  <>
    The minimum monthly installment is <strong>₹500</strong>, or such
    other amount as decided for the selected scheme.
  </>,

  <>
    All installments must be paid <strong>on or before the due date</strong>{" "}
    to remain eligible for the bonus benefit.
  </>,

  <>
    The maturity amount, including the eligible bonus, can only be
    redeemed towards the purchase of <strong>gold jewellery</strong>.
  </>,

  <>
    The gold rate applicable will be the prevailing rate on the
    date of redemption.
  </>,

  <>
    <strong>No cash refund</strong> will be provided against the
    accumulated or maturity amount.
  </>,

  <>
    Premature closure of the scheme will result in the customer
    <strong> not being eligible for the bonus</strong>.
  </>,

  <>
    The scheme is <strong>non-transferable</strong> and can only be
    availed by the registered customer.
  </>,

  <>
    Roopkamal Jewellers reserves the right to amend the scheme's terms
    and conditions in accordance with applicable requirements.
  </>,
];

export const TermsModal = ({
  open,
  onClose,
}: TermsModalProps) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 backdrop-blur-[2px] sm:items-center sm:p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="scheme-terms-title"
        onClick={(e) => e.stopPropagation()}
        className="max-h-[90vh] w-full overflow-hidden rounded-t-3xl bg-white shadow-2xl sm:max-w-xl sm:rounded-2xl"
      >
        <div className="h-1.5 bg-gradient-to-r from-[#8B6914] via-[#C9A24B] to-[#8B6914]" />

        <div className="flex items-start justify-between border-b border-stone-100 px-5 py-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[#9b782d]">
              Roopkamal Jewellers
            </p>

            <h2
              id="scheme-terms-title"
              className="mt-1 text-lg font-semibold text-stone-900"
            >
              Gold Bachat Scheme
            </h2>

            <p className="text-xs text-stone-500">
              Terms & Conditions
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close terms and conditions"
            className="rounded-full bg-stone-100 p-2 text-stone-500 transition hover:bg-stone-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[65vh] overflow-y-auto px-5 py-4">

          {/* Most important benefit */}
          <div className="mb-5 flex gap-3 rounded-xl border border-[#ead6a5] bg-[#fff8e5] p-4">
            <Gift className="mt-0.5 h-5 w-5 shrink-0 text-[#8B6914]" />

            <div>
              <p className="text-sm font-semibold text-stone-800">
                Complete 11 months, get the bonus
              </p>

              <p className="mt-1 text-xs leading-5 text-stone-600">
                Complete all required monthly installments on time to
                become eligible for the jeweller bonus.
              </p>
            </div>
          </div>

          <ol className="space-y-4">
            {terms.map((term, index) => (
              <li
                key={index}
                className="flex gap-3 text-sm leading-6 text-stone-600"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#f5eddd] text-xs font-semibold text-[#8B6914]">
                  {index + 1}
                </span>

                <span>{term}</span>
              </li>
            ))}
          </ol>

          <div className="mt-5 flex gap-2 rounded-xl bg-stone-50 p-3 text-xs leading-5 text-stone-500">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />

            Please contact Roopkamal Jewellers if you need clarification
            regarding your scheme, eligibility or redemption.
          </div>
        </div>

        <div className="border-t border-stone-100 p-4">
          <button
            type="button"
            onClick={onClose}
            className="w-full rounded-xl bg-[#4d164d] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#3e113e]"
          >
            I understand
          </button>
        </div>
      </div>
    </div>
  );
};