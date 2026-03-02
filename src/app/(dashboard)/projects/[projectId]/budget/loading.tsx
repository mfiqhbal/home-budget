function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

function CategoryGroupSkeleton({ rows }: { rows: number }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      {/* Category header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-border/50">
        <Skeleton className="w-5 h-5 rounded" />
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-4 w-16 rounded-full ml-auto" />
      </div>
      {/* Table rows */}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-0">
          <Skeleton className="w-4 h-4 rounded" />
          <Skeleton className="h-4 w-40 flex-1" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}

export default function BudgetLoading() {
  return (
    <div>
      {/* Page header */}
      <div className="mb-6">
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-80" />
      </div>

      {/* Category groups */}
      <div className="space-y-4">
        <CategoryGroupSkeleton rows={4} />
        <CategoryGroupSkeleton rows={3} />
        <CategoryGroupSkeleton rows={2} />
      </div>

      {/* Totals bar */}
      <div className="glass rounded-xl mt-4 px-4 py-3 flex items-center justify-between">
        <Skeleton className="h-5 w-20" />
        <div className="flex gap-8">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
        </div>
      </div>
    </div>
  );
}
