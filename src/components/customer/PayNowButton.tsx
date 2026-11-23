import { ArrowRight, Wallet } from "lucide-react";

interface PayNowButtonProps {
  onClick: () => void;
}

export default function PayNowButton({ onClick }: PayNowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group inline-flex items-center justify-center gap-1
        rounded-lg px-1.5 py-1 text-[9px] sm:gap-1.5 sm:px-3 sm:py-1.5 sm:text-xs
        bg-gradient-to-r from-[#B58A3A] to-[#96702E]
        text-white text-xs font-semibold
        shadow-md shadow-[#B58A3A]/20
        border border-[#C39A50]/40
        transition-all duration-200 ease-out
        hover:-translate-y-0.5
        hover:from-[#A77D32] hover:to-[#805F25]
        hover:shadow-lg hover:shadow-[#B58A3A]/30
        active:translate-y-0 active:scale-[0.98]
        focus:outline-none focus:ring-2
        focus:ring-[#B58A3A]/40 focus:ring-offset-2
      "
    >
      <Wallet size={12} strokeWidth={2} className="sm:hidden" />
      <Wallet size={14} strokeWidth={2} className="hidden sm:block" />
      <span>Pay Now</span>
      <ArrowRight
        size={11}
        strokeWidth={2}
        className="transition-transform duration-200 group-hover:translate-x-1 sm:hidden"
      />
      <ArrowRight
        size={13}
        strokeWidth={2}
        className="hidden transition-transform duration-200 group-hover:translate-x-1 sm:block"
      />
    </button>
  );
}
