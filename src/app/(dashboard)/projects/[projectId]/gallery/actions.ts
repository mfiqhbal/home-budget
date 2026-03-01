"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { galleryImageSchema } from "@/lib/validations";

export interface GalleryItemWithImages {
  id: string;
  room: string | null;
  title: string | null;
  description: string | null;
  coohom_url: string | null;
  created_at: string;
  images: {
    id: string;
    public_url: string;
    file_name: string;
    storage_path: string;
  }[];
}

export async function getGalleryImages(projectId: string): Promise<GalleryItemWithImages[]> {
  const supabase = await createClient();

  const { data: galleryItems, error } = await supabase
    .from("gallery_images")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  if (!galleryItems || galleryItems.length === 0) return [];

  const ids = galleryItems.map((g) => g.id);
  const { data: imageRows } = await supabase
    .from("images")
    .select("id, entity_id, public_url, file_name, storage_path")
    .eq("entity_type", "gallery")
    .in("entity_id", ids)
    .order("sort_order");

  const imageMap: Record<string, GalleryItemWithImages["images"]> = {};
  for (const img of imageRows ?? []) {
    if (!imageMap[img.entity_id]) imageMap[img.entity_id] = [];
    imageMap[img.entity_id].push({
      id: img.id,
      public_url: img.public_url,
      file_name: img.file_name,
      storage_path: img.storage_path,
    });
  }

  return galleryItems.map((g) => ({
    id: g.id,
    room: g.room,
    title: g.title,
    description: g.description,
    coohom_url: g.coohom_url,
    created_at: g.created_at,
    images: imageMap[g.id] ?? [],
  }));
}

export async function createGalleryImage(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = galleryImageSchema.parse({
    room: formData.get("room"),
    title: formData.get("title"),
    description: formData.get("description"),
    coohomUrl: formData.get("coohomUrl"),
  });

  const { data, error } = await supabase.from("gallery_images").insert({
    project_id: projectId,
    user_id: user.id,
    room: parsed.room,
    title: parsed.title,
    description: parsed.description,
    coohom_url: parsed.coohomUrl || null,
  }).select().single();

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/gallery`);
  return data;
}

export async function updateGalleryImage(projectId: string, imageId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = galleryImageSchema.parse({
    room: formData.get("room"),
    title: formData.get("title"),
    description: formData.get("description"),
    coohomUrl: formData.get("coohomUrl"),
  });

  const { error } = await supabase
    .from("gallery_images")
    .update({
      room: parsed.room,
      title: parsed.title,
      description: parsed.description,
      coohom_url: parsed.coohomUrl || null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", imageId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/gallery`);
}

export async function deleteGalleryImage(projectId: string, imageId: string) {
  const supabase = await createClient();

  // Delete associated uploaded images from storage
  const { data: imgs } = await supabase
    .from("images")
    .select("storage_path")
    .eq("entity_type", "gallery")
    .eq("entity_id", imageId);

  if (imgs && imgs.length > 0) {
    await supabase.storage
      .from("uploads")
      .remove(imgs.map((i) => i.storage_path));
    await supabase
      .from("images")
      .delete()
      .eq("entity_type", "gallery")
      .eq("entity_id", imageId);
  }

  const { error } = await supabase.from("gallery_images").delete().eq("id", imageId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}/gallery`);
}
