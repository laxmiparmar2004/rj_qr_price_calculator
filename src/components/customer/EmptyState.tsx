interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = ({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) => {
  return (
    <div className="rounded-[28px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm">
      <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#f3ead6] text-2xl">📦</div>
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-stone-800">{title}</h2>
      <p className="mx-auto mt-2 max-w-md text-sm text-stone-500">{description}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-[#1c1b19] px-5 py-2.5 text-sm font-medium text-white"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
};
