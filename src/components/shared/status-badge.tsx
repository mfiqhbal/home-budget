import { cn } from "@/lib/utils";
import { statusLabel } from "@/lib/format";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        status === "done" && "bg-emerald-100 text-emerald-700 border border-emerald-200",
        status === "in_progress" && "bg-blue-100 text-blue-700 border border-blue-200",
        status === "not_started" && "bg-slate-100 text-slate-600 border border-slate-200",
        status === "active" && "bg-emerald-100 text-emerald-700 border border-emerald-200",
        status === "completed" && "bg-blue-100 text-blue-700 border border-blue-200",
        status === "on_hold" && "bg-amber-100 text-amber-700 border border-amber-200",
        className
      )}
    >
      {statusLabel(status)}
    </span>
  );
}
