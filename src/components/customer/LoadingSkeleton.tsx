export const LoadingSkeleton = () => {
  return (
    <div className="min-h-screen bg-[#f7f2ea] px-4 py-8 text-stone-800 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl animate-pulse space-y-6">
        <div className="h-24 rounded-[28px] bg-stone-200/80" />
        <div className="grid gap-6 md:grid-cols-[1.3fr_0.7fr]">
          <div className="h-72 rounded-[28px] bg-stone-200/80" />
          <div className="h-72 rounded-[28px] bg-stone-200/80" />
        </div>
        <div className="h-96 rounded-[28px] bg-stone-200/80" />
      </div>
    </div>
  );
};
