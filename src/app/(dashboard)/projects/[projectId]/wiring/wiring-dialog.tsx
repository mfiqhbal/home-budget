"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createWiringPlan, updateWiringPlan } from "./actions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

interface WiringDialogProps {
  projectId: string;
  mode: "create" | "edit";
  plan?: {
    id: string;
    location: string;
    machine: string;
    plugLocation: string;
    plugType: string;
    wiringType: string;
    quantity: number;
    pricePerUnit: string;
    installationPrice: string;
    notes: string;
  };
}

export function WiringDialog({ projectId, mode, plan }: WiringDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createWiringPlan(projectId, formData);
        toast.success("Wiring plan added");
      } else {
        await updateWiringPlan(projectId, plan!.id, formData);
        toast.success("Wiring plan updated");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to ${mode} plan`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button><Plus className="w-4 h-4 mr-2" />Add Plan</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Wiring Plan" : "Edit Wiring Plan"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Location *</Label>
              <Input name="location" defaultValue={plan?.location} placeholder="e.g. Kitchen" className="glass-input" required />
            </div>
            <div className="space-y-2">
              <Label>Machine/Appliance</Label>
              <Input name="machine" defaultValue={plan?.machine} placeholder="e.g. Oven" className="glass-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Plug Location</Label>
              <Input name="plugLocation" defaultValue={plan?.plugLocation} placeholder="e.g. Behind counter" className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Plug Type</Label>
              <Input name="plugType" defaultValue={plan?.plugType} placeholder="e.g. 13A" className="glass-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Wiring Type</Label>
              <Input name="wiringType" defaultValue={plan?.wiringType} placeholder="e.g. 2.5mm" className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input name="quantity" type="number" min="1" defaultValue={plan?.quantity || 1} className="glass-input" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Price/Unit (RM)</Label>
              <Input name="pricePerUnit" type="number" step="0.01" defaultValue={plan?.pricePerUnit || "0"} className="glass-input" />
            </div>
            <div className="space-y-2">
              <Label>Installation (RM)</Label>
              <Input name="installationPrice" type="number" step="0.01" defaultValue={plan?.installationPrice || "0"} className="glass-input" />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Notes</Label>
            <Textarea name="notes" defaultValue={plan?.notes} className="glass-input" rows={2} />
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
