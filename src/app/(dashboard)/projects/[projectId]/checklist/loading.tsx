function Skeleton({ className }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-muted ${className ?? ""}`} />;
}

export default function ChecklistLoading() {
  return (
    <div>
      {/* Page header + action button */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Progress ring card */}
      <div className="glass rounded-xl py-5 px-5 mb-4">
        <div className="flex items-center gap-5">
          <Skeleton className="w-20 h-20 rounded-full shrink-0" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass rounded-xl py-3 px-4">
            <div className="flex items-center gap-3">
              <Skeleton className="w-6 h-6 rounded-full shrink-0" />
              <div className="flex-1 min-w-0 space-y-1">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="h-3 w-2/5" />
              </div>
              <Skeleton className="h-5 w-16 rounded-md" />
              <Skeleton className="h-5 w-14 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
