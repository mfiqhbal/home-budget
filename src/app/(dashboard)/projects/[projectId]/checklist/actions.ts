"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { checklistItemSchema } from "@/lib/validations";

export async function getChecklistItems(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("checklist_items")
    .select("*")
    .eq("project_id", projectId)
    .order("sort_order")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createChecklistItem(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = checklistItemSchema.parse({
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") || "not_started",
    notes: formData.get("notes"),
  });

  // Get max sort_order
  const { data: existing } = await supabase
    .from("checklist_items")
    .select("sort_order")
    .eq("project_id", projectId)
    .order("sort_order", { ascending: false })
    .limit(1);

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0;

  const { error } = await supabase.from("checklist_items").insert({
    project_id: projectId,
    user_id: user.id,
    sort_order: nextOrder,
    title: parsed.title,
    due_date: parsed.dueDate || null,
    status: parsed.status,
    notes: parsed.notes,
  });

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/checklist`);
}

export async function updateChecklistItem(projectId: string, itemId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = checklistItemSchema.parse({
    title: formData.get("title"),
    dueDate: formData.get("dueDate"),
    status: formData.get("status") || "not_started",
    notes: formData.get("notes"),
  });

  const { error } = await supabase
    .from("checklist_items")
    .update({
      title: parsed.title,
      due_date: parsed.dueDate || null,
      status: parsed.status,
      notes: parsed.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/checklist`);
}

export async function cycleChecklistStatus(projectId: string, itemId: string, currentStatus: string) {
  const supabase = await createClient();
  const nextStatus =
    currentStatus === "not_started" ? "in_progress" :
    currentStatus === "in_progress" ? "done" : "not_started";

  const { error } = await supabase
    .from("checklist_items")
    .update({ status: nextStatus, updated_at: new Date().toISOString() })
    .eq("id", itemId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/checklist`);
}

export async function deleteChecklistItem(projectId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("checklist_items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}/checklist`);
}
