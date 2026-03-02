function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ComparisonDetailLoading() {
  return (
    <div>
      {/* Back link + budget badge */}
      <div className="mb-4 flex items-center justify-between">
        <Skeleton className="h-4 w-36" />
        <Skeleton className="h-7 w-48 rounded-full" />
      </div>

      {/* Page header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Comparison items table */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Table header */}
        <div className="flex items-center gap-4 px-5 py-3 bg-muted/30 border-b border-border/50">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-16 ml-auto" />
        </div>
        {/* Table rows */}
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4 border-b border-border/30 last:border-0">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-8 rounded-md ml-auto" />
          </div>
        ))}
      </div>
    </div>
  );
}
