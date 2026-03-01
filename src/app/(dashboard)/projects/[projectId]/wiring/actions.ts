"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { wiringPlanSchema } from "@/lib/validations";

export async function getWiringPlans(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("wiring_plans")
    .select("*")
    .eq("project_id", projectId)
    .order("location")
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createWiringPlan(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = wiringPlanSchema.parse({
    location: formData.get("location"),
    machine: formData.get("machine"),
    plugLocation: formData.get("plugLocation"),
    plugType: formData.get("plugType"),
    wiringType: formData.get("wiringType"),
    quantity: parseInt(formData.get("quantity") as string) || 1,
    pricePerUnit: formData.get("pricePerUnit"),
    installationPrice: formData.get("installationPrice"),
    notes: formData.get("notes"),
  });

  const { error } = await supabase.from("wiring_plans").insert({
    project_id: projectId,
    user_id: user.id,
    location: parsed.location,
    machine: parsed.machine,
    plug_location: parsed.plugLocation,
    plug_type: parsed.plugType,
    wiring_type: parsed.wiringType,
    quantity: parsed.quantity,
    price_per_unit: parsed.pricePerUnit,
    installation_price: parsed.installationPrice,
    notes: parsed.notes,
  });

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/wiring`);
}

export async function updateWiringPlan(projectId: string, planId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = wiringPlanSchema.parse({
    location: formData.get("location"),
    machine: formData.get("machine"),
    plugLocation: formData.get("plugLocation"),
    plugType: formData.get("plugType"),
    wiringType: formData.get("wiringType"),
    quantity: parseInt(formData.get("quantity") as string) || 1,
    pricePerUnit: formData.get("pricePerUnit"),
    installationPrice: formData.get("installationPrice"),
    notes: formData.get("notes"),
  });

  const { error } = await supabase
    .from("wiring_plans")
    .update({
      location: parsed.location,
      machine: parsed.machine,
      plug_location: parsed.plugLocation,
      plug_type: parsed.plugType,
      wiring_type: parsed.wiringType,
      quantity: parsed.quantity,
      price_per_unit: parsed.pricePerUnit,
      installation_price: parsed.installationPrice,
      notes: parsed.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", planId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/wiring`);
}

export async function deleteWiringPlan(projectId: string, planId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("wiring_plans").delete().eq("id", planId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}/wiring`);
}
