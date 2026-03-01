"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createSupplier, updateSupplier } from "./actions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface SupplierDialogProps {
  projectId: string;
  mode: "create" | "edit";
  supplier?: {
    id: string;
    name: string;
    phone: string;
    email: string;
    website: string;
    products: string;
    pricing: string;
    notes: string;
  };
}

export function SupplierDialog({ projectId, mode, supplier }: SupplierDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createSupplier(projectId, formData);
        toast.success("Supplier added");
      } else {
        await updateSupplier(projectId, supplier!.id, formData);
        toast.success("Supplier updated");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to ${mode} supplier`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button><Plus className="w-4 h-4 mr-2" />Add Supplier</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Supplier" : "Edit Supplier"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Name *</Label>
            <Input name="name" defaultValue={supplier?.name} className="glass-input" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Phone</Label>
              <Input name="phone" defaultValue={supplier?.phone} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input name="email" type="email" defaultValue={supplier?.email} className="glass-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Website</Label>
            <Input name="website" type="url" defaultValue={supplier?.website} placeholder="https://..." className="glass-input" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Products</Label>
              <Textarea name="products" defaultValue={supplier?.products} className="glass-input" rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Pricing</Label>
              <Textarea name="pricing" defaultValue={supplier?.pricing} className="glass-input" rows={2} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={supplier?.notes} className="glass-input" rows={2} />
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
