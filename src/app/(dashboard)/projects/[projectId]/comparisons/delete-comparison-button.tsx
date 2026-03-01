"use client";

import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteComparison } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function DeleteComparisonButton({ projectId, comparisonId, name }: { projectId: string; comparisonId: string; name: string }) {
  const router = useRouter();

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete "${name}"?`)) return;
    try {
      await deleteComparison(projectId, comparisonId);
      toast.success("Comparison deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={handleDelete}>
      <Trash2 className="w-4 h-4" />
    </Button>
  );
}
