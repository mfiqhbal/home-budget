"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
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

function CircularProgress({ percent }: { percent: number }) {
  const r = 36;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - percent / 100);

  return (
    <div className="relative w-20 h-20 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="oklch(0.88 0.01 60 / 25%)" strokeWidth="5" />
        <circle
          cx="40" cy="40" r={r} fill="none"
          stroke="oklch(0.7 0.14 55)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-lg font-heading font-bold text-gradient">{percent}%</span>
      </div>
    </div>
  );
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

  const now = new Date();

  return (
    <div className="space-y-4">
      {/* Progress ring card */}
      <GlassCard className="py-5">
        <div className="flex items-center gap-5">
          <CircularProgress percent={progress} />
          <div>
            <p className="text-sm text-muted-foreground font-body">Progress</p>
            <p className="text-lg font-heading font-semibold">
              {doneCount} of {items.length} completed
            </p>
            <p className="text-xs text-muted-foreground font-body mt-0.5">
              {items.filter(i => i.status === "in_progress").length} in progress
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Checklist items */}
      <div className="space-y-2">
        {items.map((item) => {
          const isDone = item.status === "done";
          const isOverdue = item.due_date && new Date(item.due_date) < now && !isDone;

          return (
            <GlassCard key={item.id} className={`py-3 px-4 group ${isDone ? "opacity-60" : ""}`}>
              <div className="flex items-center gap-3">
                {/* Custom checkbox circle */}
                <button
                  onClick={() => handleCycleStatus(item.id, item.status)}
                  className={`w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all ${
                    isDone
                      ? "bg-copper border-copper text-white"
                      : item.status === "in_progress"
                        ? "border-copper/50 bg-copper/10"
                        : "border-muted-foreground/30 hover:border-copper/50"
                  }`}
                  title="Click to cycle status"
                >
                  {isDone && (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {item.status === "in_progress" && (
                    <span className="w-2 h-2 rounded-full bg-copper" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <p className={`font-medium font-body ${isDone ? "line-through text-muted-foreground" : ""}`}>
                    {item.title}
                  </p>
                  {item.notes && (
                    <p className="text-xs text-muted-foreground mt-0.5 font-body">{item.notes}</p>
                  )}
                </div>

                {item.due_date && (
                  <span className={`text-xs whitespace-nowrap font-body px-2 py-0.5 rounded-md ${
                    isOverdue
                      ? "bg-destructive/10 text-destructive font-medium"
                      : "text-muted-foreground"
                  }`}>
                    {formatDate(item.due_date)}
                  </span>
                )}

                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
          );
        })}
      </div>
    </div>
  );
}
