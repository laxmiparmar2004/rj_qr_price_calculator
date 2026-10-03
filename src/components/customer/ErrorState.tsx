interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  return (
    <div className="min-h-screen bg-[#f7f2ea] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-lg rounded-[28px] border border-red-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-2xl">⚠️</div>
        <h2 className="text-2xl font-semibold tracking-[-0.04em] text-stone-800">Something went wrong</h2>
        <p className="mt-2 text-sm text-stone-500">{message}</p>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="mt-5 rounded-full bg-[#1c1b19] px-5 py-2.5 text-sm font-medium text-white"
          >
            Try again
          </button>
        ) : null}
      </div>
    </div>
  );
};
