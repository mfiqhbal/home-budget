"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComparison, updateComparison } from "./actions";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface ComparisonDialogProps {
  projectId: string;
  mode?: "create" | "edit";
  comparison?: {
    id: string;
    name: string;
    category: string;
    itemType: string;
    notes: string;
  };
}

export function ComparisonDialog({ projectId, mode = "create", comparison }: ComparisonDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createComparison(projectId, formData);
        toast.success("Comparison group created");
      } else {
        await updateComparison(projectId, comparison!.id, formData);
        toast.success("Comparison updated");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to ${mode} comparison`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button><Plus className="w-4 h-4 mr-2" />New Comparison</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "New Comparison Group" : "Edit Comparison"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input name="name" defaultValue={comparison?.name} placeholder="e.g. Kitchen Countertop Options" className="glass-input" required />
          </div>
          <div className="space-y-2">
            <Label>Category</Label>
            <Input name="category" defaultValue={comparison?.category} placeholder="e.g. Kitchen" className="glass-input" />
          </div>
          <div className="space-y-2">
            <Label>Item Type</Label>
            <Input name="itemType" defaultValue={comparison?.itemType} placeholder="e.g. Countertop" className="glass-input" />
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={comparison?.notes} placeholder="Optional notes..." className="glass-input" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Create" : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
