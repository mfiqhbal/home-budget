"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { supplierSchema } from "@/lib/validations";

export async function getSuppliers(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("project_id", projectId)
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createSupplier(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    products: formData.get("products"),
    pricing: formData.get("pricing"),
    notes: formData.get("notes"),
  });

  const { error } = await supabase.from("suppliers").insert({
    project_id: projectId,
    user_id: user.id,
    ...parsed,
  });

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/suppliers`);
}

export async function updateSupplier(projectId: string, supplierId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = supplierSchema.parse({
    name: formData.get("name"),
    phone: formData.get("phone"),
    email: formData.get("email"),
    website: formData.get("website"),
    products: formData.get("products"),
    pricing: formData.get("pricing"),
    notes: formData.get("notes"),
  });

  const { error } = await supabase
    .from("suppliers")
    .update({ ...parsed, updated_at: new Date().toISOString() })
    .eq("id", supplierId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/suppliers`);
}

export async function deleteSupplier(projectId: string, supplierId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", supplierId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}/suppliers`);
}
