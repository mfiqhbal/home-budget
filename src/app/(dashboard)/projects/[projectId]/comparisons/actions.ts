"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { comparisonSchema, comparisonItemSchema } from "@/lib/validations";

export async function getComparisons(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparisons")
    .select("*, budget_items(id, item_name, category)")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getComparison(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparisons")
    .select("*, budget_items(id, item_name, category)")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function getComparisonItems(comparisonId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("comparison_items")
    .select("*, suppliers(name), link_image, link_title")
    .eq("comparison_id", comparisonId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createComparison(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = comparisonSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    itemType: formData.get("itemType"),
    notes: formData.get("notes"),
  });

  const { error } = await supabase.from("comparisons").insert({
    project_id: projectId,
    user_id: user.id,
    name: parsed.name,
    category: parsed.category,
    item_type: parsed.itemType,
    notes: parsed.notes,
  });

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/comparisons`);
}

export async function updateComparison(projectId: string, comparisonId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = comparisonSchema.parse({
    name: formData.get("name"),
    category: formData.get("category"),
    itemType: formData.get("itemType"),
    notes: formData.get("notes"),
  });

  const { error } = await supabase
    .from("comparisons")
    .update({
      name: parsed.name,
      category: parsed.category,
      item_type: parsed.itemType,
      notes: parsed.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", comparisonId);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/comparisons`);
}

export async function deleteComparison(projectId: string, comparisonId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("comparisons").delete().eq("id", comparisonId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}/comparisons`);
  revalidatePath(`/projects/${projectId}/budget`);
}

export async function createComparisonItem(projectId: string, comparisonId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const parsed = comparisonItemSchema.parse({
    productName: formData.get("productName"),
    price: formData.get("price"),
    quantity: parseInt(formData.get("quantity") as string) || 1,
    transportCost: formData.get("transportCost"),
    link: formData.get("link"),
    supplierId: formData.get("supplierId"),
    remark: formData.get("remark"),
    isSelected: formData.get("isSelected") === "true",
  });

  const price = parseFloat(parsed.price) || 0;
  const transport = parseFloat(parsed.transportCost) || 0;
  const totalCost = (price * parsed.quantity + transport).toFixed(2);

  const { error } = await supabase.from("comparison_items").insert({
    comparison_id: comparisonId,
    user_id: user.id,
    product_name: parsed.productName,
    price: parsed.price,
    quantity: parsed.quantity,
    transport_cost: parsed.transportCost,
    total_cost: totalCost,
    link: parsed.link || null,
    supplier_id: parsed.supplierId && parsed.supplierId !== "none" ? parsed.supplierId : null,
    remark: parsed.remark,
    is_selected: parsed.isSelected,
  });

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/comparisons/${comparisonId}`);
}

export async function updateComparisonItem(projectId: string, comparisonId: string, itemId: string, formData: FormData) {
  const supabase = await createClient();

  const parsed = comparisonItemSchema.parse({
    productName: formData.get("productName"),
    price: formData.get("price"),
    quantity: parseInt(formData.get("quantity") as string) || 1,
    transportCost: formData.get("transportCost"),
    link: formData.get("link"),
    supplierId: formData.get("supplierId"),
    remark: formData.get("remark"),
    isSelected: formData.get("isSelected") === "true",
  });

  const price = parseFloat(parsed.price) || 0;
  const transport = parseFloat(parsed.transportCost) || 0;
  const totalCost = (price * parsed.quantity + transport).toFixed(2);

  // Get current item to check if link changed
  const { data: currentItem } = await supabase
    .from("comparison_items")
    .select("link")
    .eq("id", itemId)
    .single();

  const linkChanged = currentItem?.link !== (parsed.link || null);

  const { error } = await supabase
    .from("comparison_items")
    .update({
      product_name: parsed.productName,
      price: parsed.price,
      quantity: parsed.quantity,
      transport_cost: parsed.transportCost,
      total_cost: totalCost,
      link: parsed.link || null,
      supplier_id: parsed.supplierId && parsed.supplierId !== "none" ? parsed.supplierId : null,
      remark: parsed.remark,
      is_selected: parsed.isSelected,
      // Clear cached preview if link changed so it re-fetches
      ...(linkChanged ? { link_image: null, link_title: null } : {}),
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId);

  if (error) throw error;

  // If this item is selected, sync to budget
  if (parsed.isSelected) {
    await syncSelectedToBudget(supabase, comparisonId, projectId);
  }

  revalidatePath(`/projects/${projectId}/comparisons/${comparisonId}`);
  revalidatePath(`/projects/${projectId}/budget`);
}

export async function deleteComparisonItem(projectId: string, comparisonId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("comparison_items").delete().eq("id", itemId);
  if (error) throw error;

  await syncSelectedToBudget(supabase, comparisonId, projectId);

  revalidatePath(`/projects/${projectId}/comparisons/${comparisonId}`);
  revalidatePath(`/projects/${projectId}/budget`);
}

export async function toggleComparisonItemSelected(projectId: string, comparisonId: string, itemId: string, isSelected: boolean) {
  const supabase = await createClient();

  // If selecting, deselect others first (only 1 selected per comparison)
  if (isSelected) {
    await supabase
      .from("comparison_items")
      .update({ is_selected: false, updated_at: new Date().toISOString() })
      .eq("comparison_id", comparisonId)
      .neq("id", itemId);
  }

  const { error } = await supabase
    .from("comparison_items")
    .update({ is_selected: isSelected, updated_at: new Date().toISOString() })
    .eq("id", itemId);
  if (error) throw error;

  // Sync selected item's total_cost to linked budget item's actual_amount
  await syncSelectedToBudget(supabase, comparisonId, projectId);

  revalidatePath(`/projects/${projectId}/comparisons/${comparisonId}`);
  revalidatePath(`/projects/${projectId}/budget`);
  revalidatePath(`/projects/${projectId}`);
}

// Helper: sync the selected comparison item's total_cost to the linked budget item
async function syncSelectedToBudget(
  supabase: Awaited<ReturnType<typeof createClient>>,
  comparisonId: string,
  projectId: string
) {
  // Get the comparison to find linked budget item
  const { data: comparison } = await supabase
    .from("comparisons")
    .select("budget_item_id")
    .eq("id", comparisonId)
    .single();

  if (!comparison?.budget_item_id) return;

  // Get the selected item's total cost
  const { data: selectedItems } = await supabase
    .from("comparison_items")
    .select("total_cost")
    .eq("comparison_id", comparisonId)
    .eq("is_selected", true)
    .limit(1);

  const actualAmount = selectedItems?.[0]?.total_cost || "0";

  // Update budget item's actual_amount
  await supabase
    .from("budget_items")
    .update({
      actual_amount: actualAmount,
      updated_at: new Date().toISOString(),
    })
    .eq("id", comparison.budget_item_id);
}
