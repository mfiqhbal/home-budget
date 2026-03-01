"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, Pencil, ExternalLink, ImagePlus, Loader2, MapPin, ZoomIn, Upload } from "lucide-react";
import { GalleryDialog } from "./gallery-dialog";
import { deleteGalleryImage } from "./actions";
import type { GalleryItemWithImages } from "./actions";
import { Lightbox } from "./lightbox";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/auth/auth-provider";
import Image from "next/image";

interface GalleryGridProps {
  items: GalleryItemWithImages[];
  projectId: string;
  rooms: string[];
}

interface FlatImage {
  url: string;
  fileName: string;
  galleryItem: GalleryItemWithImages;
}

export function GalleryGrid({ items, projectId, rooms }: GalleryGridProps) {
  const [filter, setFilter] = useState<string | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const supabase = createClient();

  const filtered = filter ? items.filter((i) => i.room === filter) : items;

  // Flatten all images for lightbox navigation
  const allImages: FlatImage[] = [];
  for (const item of filtered) {
    for (const img of item.images) {
      allImages.push({
        url: img.public_url,
        fileName: img.file_name,
        galleryItem: item,
      });
    }
  }

  // Room counts
  const roomCounts: Record<string, number> = {};
  for (const item of items) {
    if (item.room) {
      roomCounts[item.room] = (roomCounts[item.room] || 0) + 1;
    }
  }

  function openLightbox(galleryItem: GalleryItemWithImages, imageIndex: number) {
    // Find the flat index
    let flatIdx = 0;
    for (const item of filtered) {
      if (item.id === galleryItem.id) {
        flatIdx += imageIndex;
        break;
      }
      flatIdx += item.images.length;
    }
    setLightboxIndex(flatIdx);
  }

  async function handleDelete(imageId: string) {
    if (!confirm("Delete this gallery item and all its images?")) return;
    try {
      await deleteGalleryImage(projectId, imageId);
      toast.success("Deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const handleUpload = useCallback(
    async (galleryItemId: string, e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files || !user) return;

      setUploadingId(galleryItemId);

      for (const file of Array.from(files)) {
        const ext = file.name.split(".").pop();
        const path = `${user.id}/gallery/${galleryItemId}/${Date.now()}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("uploads")
          .upload(path, file);

        if (uploadError) {
          toast.error(`Failed to upload ${file.name}`);
          continue;
        }

        const {
          data: { publicUrl },
        } = supabase.storage.from("uploads").getPublicUrl(path);

        const { error: dbError } = await supabase.from("images").insert({
          user_id: user.id,
          entity_type: "gallery",
          entity_id: galleryItemId,
          storage_path: path,
          public_url: publicUrl,
          file_name: file.name,
          file_size: file.size,
          mime_type: file.type,
          sort_order: 0,
        });

        if (dbError) {
          toast.error(`Failed to save ${file.name}`);
        }
      }

      setUploadingId(null);
      e.target.value = "";
      router.refresh();
    },
    [user, supabase, router]
  );

  return (
    <div>
      {/* Room filter pills */}
      {rooms.length > 0 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          <button
            onClick={() => setFilter(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              filter === null
                ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                : "bg-white/40 hover:bg-white/60 text-foreground/80 border border-white/30"
            }`}
          >
            All ({items.length})
          </button>
          {rooms.map((room) => (
            <button
              key={room}
              onClick={() => setFilter(room)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                filter === room
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "bg-white/40 hover:bg-white/60 text-foreground/80 border border-white/30"
              }`}
            >
              {room} ({roomCounts[room] || 0})
            </button>
          ))}
        </div>
      )}

      {/* Image grid - masonry style */}
      <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-white/40 backdrop-blur-sm border border-white/30 shadow-sm hover:shadow-xl hover:shadow-primary/5 transition-all duration-300"
          >
            {/* Images */}
            {item.images.length > 0 ? (
              <div>
                {/* Hero image */}
                <div
                  className="relative cursor-pointer overflow-hidden"
                  onClick={() => openLightbox(item, 0)}
                >
                  <div className="relative aspect-[4/3]">
                    <Image
                      src={item.images[0].public_url}
                      alt={item.title || item.images[0].file_name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>

                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
                      <ZoomIn className="w-5 h-5 text-white" />
                    </div>
                  </div>

                  {/* Room badge */}
                  {item.room && (
                    <div className="absolute top-3 left-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/10">
                        <MapPin className="w-3 h-3" />
                        {item.room}
                      </span>
                    </div>
                  )}

                  {/* Image count badge */}
                  {item.images.length > 1 && (
                    <div className="absolute top-3 right-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-black/40 backdrop-blur-md text-white border border-white/10">
                        <ImagePlus className="w-3 h-3" />
                        {item.images.length}
                      </span>
                    </div>
                  )}
                </div>

                {/* Thumbnail strip for multiple images */}
                {item.images.length > 1 && (
                  <div className="flex gap-1 px-3 pt-2">
                    {item.images.slice(1, 5).map((img, idx) => (
                      <button
                        key={img.id}
                        onClick={() => openLightbox(item, idx + 1)}
                        className="relative w-14 h-14 rounded-lg overflow-hidden border border-white/30 hover:border-primary/50 transition-colors shrink-0"
                      >
                        <Image
                          src={img.public_url}
                          alt={img.file_name}
                          fill
                          className="object-cover"
                          sizes="56px"
                        />
                      </button>
                    ))}
                    {item.images.length > 5 && (
                      <button
                        onClick={() => openLightbox(item, 5)}
                        className="w-14 h-14 rounded-lg bg-black/5 border border-white/30 flex items-center justify-center text-xs font-semibold text-muted-foreground hover:bg-black/10 transition-colors shrink-0"
                      >
                        +{item.images.length - 5}
                      </button>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Empty state - upload prompt */
              <label className="flex flex-col items-center justify-center py-12 px-6 cursor-pointer hover:bg-white/20 transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-3">
                  {uploadingId === item.id ? (
                    <Loader2 className="w-6 h-6 text-primary animate-spin" />
                  ) : (
                    <Upload className="w-6 h-6 text-primary" />
                  )}
                </div>
                <p className="text-sm font-medium text-foreground/80 mb-1">
                  {uploadingId === item.id ? "Uploading..." : "Upload images"}
                </p>
                <p className="text-xs text-muted-foreground">Click to browse</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleUpload(item.id, e)}
                  className="hidden"
                  disabled={uploadingId === item.id}
                />
              </label>
            )}

            {/* Card info */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground truncate">
                    {item.title || "Untitled"}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Action buttons - visible on hover */}
                <div className="flex gap-0.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  {/* Upload more */}
                  <label className="inline-flex items-center justify-center h-8 w-8 rounded-md hover:bg-black/5 cursor-pointer transition-colors">
                    {uploadingId === item.id ? (
                      <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                    ) : (
                      <ImagePlus className="w-4 h-4 text-muted-foreground" />
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleUpload(item.id, e)}
                      className="hidden"
                      disabled={uploadingId === item.id}
                    />
                  </label>
                  <GalleryDialog
                    projectId={projectId}
                    mode="edit"
                    image={{
                      id: item.id,
                      room: item.room || "",
                      title: item.title || "",
                      description: item.description || "",
                      coohomUrl: item.coohom_url || "",
                    }}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => handleDelete(item.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Coohom link */}
              {item.coohom_url && (
                <a
                  href={item.coohom_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 mt-2 font-medium"
                >
                  <ExternalLink className="w-3 h-3" />
                  View in Coohom
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && allImages.length > 0 && (
        <Lightbox
          allImages={allImages}
          currentIndex={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </div>
  );
}
