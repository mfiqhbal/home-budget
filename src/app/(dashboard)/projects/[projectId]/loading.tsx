function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ProjectLoading() {
  return (
    <div>
      {/* Page header skeleton */}
      <div className="mb-6">
        <Skeleton className="h-8 w-56 mb-2" />
        <Skeleton className="h-4 w-72" />
      </div>

      {/* Hero card skeleton */}
      <div className="glass rounded-xl p-5 mb-4">
        <div className="flex items-center gap-8">
          <Skeleton className="w-24 h-24 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-40" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl py-3 px-4">
            <div className="flex items-center gap-2.5">
              <Skeleton className="w-8 h-8 rounded-lg" />
              <div className="space-y-1.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Priority cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass rounded-xl py-3 px-4 card-accent-left">
            <div className="flex items-center justify-between mb-2">
              <Skeleton className="h-5 w-12 rounded-full" />
              <Skeleton className="h-3 w-14" />
            </div>
            <div className="flex justify-between mb-2">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-1 w-full rounded-full" />
          </div>
        ))}
      </div>

      {/* Charts skeleton */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="glass rounded-xl p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="glass rounded-xl p-5">
          <Skeleton className="h-5 w-32 mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </div>
  );
}
