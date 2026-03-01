"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Trash2, RotateCcw } from "lucide-react";
import { cycleChecklistStatus, deleteChecklistItem } from "./actions";
import { ChecklistItemDialog } from "./checklist-item-dialog";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatDate } from "@/lib/format";

interface ChecklistTableProps {
  items: Array<{
    id: string;
    title: string;
    due_date: string | null;
    status: string;
    notes: string | null;
    sort_order: number;
  }>;
  projectId: string;
}

export function ChecklistTable({ items, projectId }: ChecklistTableProps) {
  const router = useRouter();

  const doneCount = items.filter((i) => i.status === "done").length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  async function handleCycleStatus(itemId: string, status: string) {
    try {
      await cycleChecklistStatus(projectId, itemId, status);
      router.refresh();
    } catch {
      toast.error("Failed to update status");
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this checklist item?")) return;
    try {
      await deleteChecklistItem(projectId, itemId);
      toast.success("Item deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="space-y-4">
      <GlassCard className="py-4">
        <div className="flex items-center gap-4">
          <Progress value={progress} className="flex-1" />
          <span className="text-sm font-medium text-muted-foreground whitespace-nowrap">
            {progress}%
          </span>
        </div>
      </GlassCard>

      <div className="space-y-2">
        {items.map((item) => (
          <GlassCard key={item.id} className="py-3 px-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => handleCycleStatus(item.id, item.status)}
                className="shrink-0"
                title="Click to cycle status"
              >
                <StatusBadge status={item.status} className="cursor-pointer" />
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-medium ${item.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                  {item.title}
                </p>
                {item.notes && (
                  <p className="text-xs text-muted-foreground mt-0.5">{item.notes}</p>
                )}
              </div>

              {item.due_date && (
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {formatDate(item.due_date)}
                </span>
              )}

              <div className="flex gap-1">
                <ChecklistItemDialog
                  projectId={projectId}
                  mode="edit"
                  item={{
                    id: item.id,
                    title: item.title,
                    dueDate: item.due_date || "",
                    status: item.status,
                    notes: item.notes || "",
                  }}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
