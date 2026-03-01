import { cn } from "@/lib/utils";

interface PriorityBadgeProps {
  priority: number;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        priority === 1 && "priority-p1",
        priority === 2 && "priority-p2",
        priority === 3 && "priority-p3",
        className
      )}
    >
      P{priority}
    </span>
  );
}
