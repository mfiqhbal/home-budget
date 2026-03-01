"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import { Button } from "@/components/ui/button";
import { ImagePlus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";

interface ImageUploadProps {
  entityType: string;
  entityId: string;
  maxFiles?: number;
}

interface UploadedImage {
  id: string;
  public_url: string;
  file_name: string;
}

export function ImageUpload({ entityType, entityId, maxFiles = 5 }: ImageUploadProps) {
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const { user } = useAuth();
  const supabase = createClient();

  useEffect(() => {
    loadImages();
  }, [entityId]);

  async function loadImages() {
    const { data } = await supabase
      .from("images")
      .select("id, public_url, file_name")
      .eq("entity_type", entityType)
      .eq("entity_id", entityId)
      .order("sort_order");
    if (data) setImages(data);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || !user) return;

    setUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= maxFiles) {
        toast.error(`Max ${maxFiles} images allowed`);
        break;
      }

      const ext = file.name.split(".").pop();
      const path = `${user.id}/${entityType}/${entityId}/${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("uploads")
        .upload(path, file);

      if (uploadError) {
        toast.error(`Failed to upload ${file.name}`);
        continue;
      }

      const { data: { publicUrl } } = supabase.storage
        .from("uploads")
        .getPublicUrl(path);

      const { error: dbError } = await supabase.from("images").insert({
        user_id: user.id,
        entity_type: entityType,
        entity_id: entityId,
        storage_path: path,
        public_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        mime_type: file.type,
        sort_order: images.length,
      });

      if (dbError) {
        toast.error(`Failed to save ${file.name}`);
        continue;
      }
    }

    await loadImages();
    setUploading(false);
    e.target.value = "";
  }

  async function handleRemove(imageId: string, storagePath: string) {
    await supabase.storage.from("uploads").remove([storagePath]);
    await supabase.from("images").delete().eq("id", imageId);
    setImages((prev) => prev.filter((img) => img.id !== imageId));
  }

  return (
    <div className="space-y-2">
      {images.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {images.map((img) => (
            <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-white/30">
              <Image
                src={img.public_url}
                alt={img.file_name}
                fill
                className="object-cover"
                sizes="80px"
              />
              <button
                onClick={() => handleRemove(img.id, img.public_url)}
                className="absolute top-0 right-0 bg-destructive text-white rounded-bl-lg p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length < maxFiles && (
        <label className="inline-flex items-center gap-1.5 text-xs text-muted-foreground cursor-pointer hover:text-foreground transition-colors">
          {uploading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <ImagePlus className="w-3.5 h-3.5" />
          )}
          {uploading ? "Uploading..." : "Add image"}
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleUpload}
            className="hidden"
            disabled={uploading}
          />
        </label>
      )}
    </div>
  );
}
