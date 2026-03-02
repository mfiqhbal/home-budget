function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function WiringLoading() {
  return (
    <div>
      {/* Page header + action button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-36" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Total cost summary card */}
      <div className="glass rounded-xl p-5 mb-6">
        <div className="flex items-center gap-3">
          <Skeleton className="w-9 h-9 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-7 w-32" />
          </div>
        </div>
      </div>

      {/* Location-grouped tables */}
      {["Living Room", "Kitchen", "Bedroom"].map((loc) => (
        <div key={loc} className="mb-4">
          <div className="flex items-center gap-2 mb-2 px-1">
            <Skeleton className="w-4 h-4 rounded" />
            <Skeleton className="h-5 w-28" />
          </div>
          <div className="glass rounded-xl overflow-hidden">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3 border-b border-border/30 last:border-0">
                <Skeleton className="h-4 w-36 flex-1" />
                <Skeleton className="h-4 w-12" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-8 w-8 rounded-md" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
