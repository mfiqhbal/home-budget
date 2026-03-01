"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBudgetItem, updateBudgetItem } from "./actions";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

const CATEGORIES = [
  "Kitchen",
  "Bathroom",
  "Bedroom",
  "Living Room",
  "Wiring",
  "Plumbing",
  "Flooring",
  "Painting",
  "Furniture",
  "Appliances",
  "Exterior",
  "Other",
];

interface BudgetItemDialogProps {
  projectId: string;
  mode: "create" | "edit";
  item?: {
    id: string;
    category: string;
    type: string;
    itemName: string;
    estimateAmount: string;
    actualAmount: string;
    priority: number;
    notes: string;
  };
}

export function BudgetItemDialog({ projectId, mode, item }: BudgetItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createBudgetItem(projectId, formData);
        toast.success("Budget item added");
      } else {
        await updateBudgetItem(projectId, item!.id, formData);
        toast.success("Budget item updated");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to ${mode} item`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Item
          </Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Pencil className="w-4 h-4" />
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Budget Item" : "Edit Budget Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select name="category" defaultValue={item?.category || ""} required>
                <SelectTrigger className="glass-input">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Type</Label>
              <Input name="type" defaultValue={item?.type} placeholder="e.g. Material" className="glass-input" />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Item Name *</Label>
            <Input name="itemName" defaultValue={item?.itemName} placeholder="e.g. Cabinet hardware" className="glass-input" required />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Estimate (RM)</Label>
              <Input name="estimateAmount" type="number" step="0.01" defaultValue={item?.estimateAmount || "0"} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Actual (RM)</Label>
              <Input name="actualAmount" type="number" step="0.01" defaultValue={item?.actualAmount || "0"} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Priority</Label>
              <Select name="priority" defaultValue={String(item?.priority || 3)}>
                <SelectTrigger className="glass-input">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">P1 - High</SelectItem>
                  <SelectItem value="2">P2 - Medium</SelectItem>
                  <SelectItem value="3">P3 - Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={item?.notes} placeholder="Optional notes..." className="glass-input" rows={2} />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : mode === "create" ? "Add Item" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
