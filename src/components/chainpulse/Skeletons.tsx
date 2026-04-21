const Shimmer = ({ className = "" }: { className?: string }) => (
  <div className={`relative overflow-hidden rounded-md bg-white/[0.04] ${className}`}>
    <div className="absolute inset-0 -translate-x-full animate-shimmer bg-gradient-to-r from-transparent via-white/[0.06] to-transparent" />
  </div>
);

export const HeaderSkeleton = () => (
  <div className="glass rounded-2xl p-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Shimmer className="h-12 w-12 rounded-xl" />
        <div className="space-y-2">
          <Shimmer className="h-3 w-16" />
          <Shimmer className="h-5 w-48" />
        </div>
      </div>
      <Shimmer className="h-8 w-32 rounded-full" />
    </div>
  </div>
);

export const CardSkeleton = ({ lines = 4 }: { lines?: number }) => (
  <div className="glass space-y-3 rounded-2xl p-6">
    <Shimmer className="h-4 w-24" />
    {Array.from({ length: lines }).map((_, i) => (
      <Shimmer key={i} className="h-3 w-full" />
    ))}
  </div>
);

export const TableSkeleton = () => (
  <div className="glass space-y-3 rounded-2xl p-6">
    <Shimmer className="h-4 w-40" />
    {Array.from({ length: 6 }).map((_, i) => (
      <Shimmer key={i} className="h-8 w-full" />
    ))}
  </div>
);

export const ChartSkeleton = () => (
  <div className="glass space-y-3 rounded-2xl p-6">
    <Shimmer className="h-4 w-24" />
    <Shimmer className="h-48 w-full" />
  </div>
);