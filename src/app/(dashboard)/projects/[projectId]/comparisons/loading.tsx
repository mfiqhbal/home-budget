function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ComparisonsLoading() {
  return (
    <div>
      {/* Page header + action button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-52 mb-2" />
          <Skeleton className="h-4 w-72" />
        </div>
        <Skeleton className="h-10 w-36 rounded-md" />
      </div>

      {/* Comparison cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass rounded-xl p-5 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-5 w-20 rounded-full" />
            <div className="flex items-center gap-1.5 bg-muted/30 rounded-md px-2 py-1.5">
              <Skeleton className="w-3 h-3 rounded-full" />
              <Skeleton className="h-3 w-40" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  );
}
