import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: number;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const p = Number(priority);
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        p === 1 && "priority-p1",
        p === 2 && "priority-p2",
        p === 3 && "priority-p3",
        className
      )}
    >
      P{p}
    </span>
  );
}
