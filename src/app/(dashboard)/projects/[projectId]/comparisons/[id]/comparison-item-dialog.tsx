"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createComparisonItem, updateComparisonItem } from "../actions";
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

interface ComparisonItemDialogProps {
  projectId: string;
  comparisonId: string;
  suppliers: Array<{ id: string; name: string }>;
  mode: "create" | "edit";
  item?: {
    id: string;
    productName: string;
    price: string;
    quantity: number;
    transportCost: string;
    link: string;
    supplierId: string;
    remark: string;
    isSelected: boolean;
  };
}

export function ComparisonItemDialog({ projectId, comparisonId, suppliers, mode, item }: ComparisonItemDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createComparisonItem(projectId, comparisonId, formData);
        toast.success("Product added");
      } else {
        await updateComparisonItem(projectId, comparisonId, item!.id, formData);
        toast.success("Product updated");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to ${mode} product`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button><Plus className="w-4 h-4 mr-2" />Add Product</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Product" : "Edit Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Product Name *</Label>
            <Input name="productName" defaultValue={item?.productName} className="glass-input" required />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Price (RM)</Label>
              <Input name="price" type="number" step="0.01" defaultValue={item?.price || "0"} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input name="quantity" type="number" min="1" defaultValue={item?.quantity || 1} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Transport (RM)</Label>
              <Input name="transportCost" type="number" step="0.01" defaultValue={item?.transportCost || "0"} className="glass-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input name="link" type="url" defaultValue={item?.link} placeholder="https://..." className="glass-input" />
          </div>
          <div className="space-y-2">
            <Label>Supplier</Label>
            <Select name="supplierId" defaultValue={item?.supplierId || "none"}>
              <SelectTrigger className="glass-input">
                <SelectValue placeholder="Select supplier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {suppliers.map((s) => (
                  <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Remark</Label>
            <Textarea name="remark" defaultValue={item?.remark} className="glass-input" rows={2} />
          </div>
          <input type="hidden" name="isSelected" value={item?.isSelected ? "true" : "false"} />
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={loading}>{loading ? "Saving..." : mode === "create" ? "Add" : "Save"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
