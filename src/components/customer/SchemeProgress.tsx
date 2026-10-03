interface SchemeProgressProps {
  current: number;
  total: number;
  label: string;
}

export const SchemeProgress = ({ current, total, label }: SchemeProgressProps) => {
  const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between text-xs font-medium uppercase tracking-[0.18em] text-stone-400">
        <span>{label}</span>
        <span>{Math.round(percent)}%</span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-stone-200">
        <div
          className="h-full rounded-full bg-[linear-gradient(90deg,#d6b56d_0%,#b88a2d_100%)]"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
};
