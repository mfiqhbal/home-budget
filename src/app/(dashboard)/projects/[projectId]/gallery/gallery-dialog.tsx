"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createGalleryImage, updateGalleryImage } from "./actions";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

const ROOMS = [
  "Living Room",
  "Kitchen",
  "Master Bedroom",
  "Bedroom 2",
  "Bedroom 3",
  "Bathroom",
  "Dining Room",
  "Study",
  "Balcony",
  "Exterior",
  "Other",
];

interface GalleryDialogProps {
  projectId: string;
  mode: "create" | "edit";
  image?: {
    id: string;
    room: string;
    title: string;
    description: string;
    coohomUrl: string;
  };
}

export function GalleryDialog({ projectId, mode, image }: GalleryDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    try {
      const formData = new FormData(e.currentTarget);
      if (mode === "create") {
        await createGalleryImage(projectId, formData);
        toast.success("Gallery item added");
      } else {
        await updateGalleryImage(projectId, image!.id, formData);
        toast.success("Gallery item updated");
      }
      setOpen(false);
      router.refresh();
    } catch {
      toast.error(`Failed to ${mode}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {mode === "create" ? (
          <Button><Plus className="w-4 h-4 mr-2" />Add Image</Button>
        ) : (
          <Button variant="ghost" size="icon" className="h-8 w-8"><Pencil className="w-4 h-4" /></Button>
        )}
      </DialogTrigger>
      <DialogContent className="glass">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Add Gallery Item" : "Edit Gallery Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input name="title" defaultValue={image?.title} placeholder="e.g. Kitchen Render" className="glass-input" />
          </div>
          <div className="space-y-2">
            <Label>Room</Label>
            <Input name="room" defaultValue={image?.room} placeholder="e.g. Kitchen" className="glass-input" list="rooms" />
            <datalist id="rooms">
              {ROOMS.map((r) => <option key={r} value={r} />)}
            </datalist>
          </div>
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea name="description" defaultValue={image?.description} className="glass-input" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>Coohom URL</Label>
            <Input name="coohomUrl" type="url" defaultValue={image?.coohomUrl} placeholder="https://www.coohom.com/..." className="glass-input" />
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
