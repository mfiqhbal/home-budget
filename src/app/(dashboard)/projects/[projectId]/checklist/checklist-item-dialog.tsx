"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createChecklistItem, updateChecklistItem } from "./actions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface ChecklistItemDialogProps {
  projectId: string;
  mode: "create" | "edit";
  item?: {
    id: string;
    title: string;
    dueDate: string;
    status: string;
    notes: string;
  };
}

export function ChecklistItemDialog({ projectId, mode, item }: ChecklistItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createChecklistItem(projectId, formData);
        toast.success("Item added");
      } else {
        await updateChecklistItem(projectId, item!.id, formData);
        toast.success("Item updated");
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
          <Button><Plus className="w-4 h-4 mr-2" />Add Item</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Checklist Item" : "Edit Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input name="title" defaultValue={item?.title} className="glass-input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input name="dueDate" type="date" defaultValue={item?.dueDate?.split("T")[0]} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select name="status" defaultValue={item?.status || "not_started"}>
                <SelectTrigger className="glass-input"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="not_started">Not Started</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="done">Done</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={item?.notes} className="glass-input" rows={2} />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : mode === "create" ? "Add" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
