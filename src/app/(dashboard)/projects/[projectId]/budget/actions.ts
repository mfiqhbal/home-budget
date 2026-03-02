"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { budgetItemSchema } from "@/lib/validations";

export async function getBudgetItems(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_items")
    .select("*")
    .eq("project_id", projectId)
    .order("category")
    .order("sort_order")
    .order("created_at");

  if (error) throw error;
  return data ?? [];
}

// Get comparison info linked to each budget item
export async function getLinkedComparisons(projectId: string) {
  const supabase = await createClient();

  const { data: comparisons } = await supabase
    .from("comparisons")
    .select("id, name, budget_item_id")
    .eq("project_id", projectId)
    .not("budget_item_id", "is", null);

  if (!comparisons || comparisons.length === 0) return {};

  const compIds = comparisons.map((c) => c.id);
  const { data: selectedItems } = await supabase
    .from("comparison_items")
    .select("comparison_id, product_name, total_cost, suppliers(name)")
    .in("comparison_id", compIds)
    .eq("is_selected", true);

  const result: Record<string, {
    comparisonId: string;
    comparisonName: string;
    selectedProduct?: string;
    selectedCost?: string;
    supplierName?: string;
  }> = {};

  for (const comp of comparisons) {
    if (!comp.budget_item_id) continue;
    const selected = selectedItems?.find((s) => s.comparison_id === comp.id);
    result[comp.budget_item_id] = {
      comparisonId: comp.id,
      comparisonName: comp.name,
      selectedProduct: selected?.product_name,
      selectedCost: selected?.total_cost,
      supplierName: (selected?.suppliers as unknown as { name: string } | null)?.name,
    };
  }

  return result;
}

// Create or get existing comparison for a budget item
export async function getOrCreateComparison(projectId: string, budgetItemId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Check if comparison already exists for this budget item
  const { data: existing } = await supabase
    .from("comparisons")
    .select("id")
    .eq("budget_item_id", budgetItemId)
    .limit(1);

  if (existing && existing.length > 0) {
    return existing[0].id;
  }

  // Get budget item details for naming
  const { data: budgetItem } = await supabase
    .from("budget_items")
    .select("item_name, category")
    .eq("id", budgetItemId)
    .single();

  if (!budgetItem) throw new Error("Budget item not found");

  // Create new comparison linked to this budget item
  const { data, error } = await supabase
    .from("comparisons")
    .insert({
      project_id: projectId,
      user_id: user.id,
      name: budgetItem.item_name,
      category: budgetItem.category,
      budget_item_id: budgetItemId,
    })
    .select("id")
    .single();

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/budget`);
  revalidatePath(`/projects/${projectId}/comparisons`);
  return data.id;
}

export async function createBudgetItem(projectId: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  const raw = {
    category: formData.get("category") as string,
    type: formData.get("type") as string,
    itemName: formData.get("itemName") as string,
    estimateAmount: formData.get("estimateAmount") as string,
    actualAmount: formData.get("actualAmount") as string,
    priority: parseInt(formData.get("priority") as string) || 3,
    notes: formData.get("notes") as string,
  };

  const parsed = budgetItemSchema.parse(raw);

  const { error } = await supabase.from("budget_items").insert({
    project_id: projectId,
    user_id: user.id,
    category: parsed.category,
    type: parsed.type,
    item_name: parsed.itemName,
    estimate_amount: parsed.estimateAmount,
    actual_amount: parsed.actualAmount,
    priority: parsed.priority,
    notes: parsed.notes,
  });

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/budget`);
  revalidatePath(`/projects/${projectId}`);
}

export async function updateBudgetItem(projectId: string, itemId: string, formData: FormData) {
  const supabase = await createClient();

  const raw = {
    category: formData.get("category") as string,
    type: formData.get("type") as string,
    itemName: formData.get("itemName") as string,
    estimateAmount: formData.get("estimateAmount") as string,
    actualAmount: formData.get("actualAmount") as string,
    priority: parseInt(formData.get("priority") as string) || 3,
    notes: formData.get("notes") as string,
  };

  const parsed = budgetItemSchema.parse(raw);

  const { data, error } = await supabase
    .from("budget_items")
    .update({
      category: parsed.category,
      type: parsed.type,
      item_name: parsed.itemName,
      estimate_amount: parsed.estimateAmount,
      actual_amount: parsed.actualAmount,
      priority: parsed.priority,
      notes: parsed.notes,
      updated_at: new Date().toISOString(),
    })
    .eq("id", itemId)
    .select();

  if (error) throw error;
  if (!data || data.length === 0) throw new Error("Update failed — row not found or RLS denied");
  revalidatePath(`/projects/${projectId}/budget`);
  revalidatePath(`/projects/${projectId}`);
}

export async function getCategoryOrders(projectId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("budget_category_orders")
    .select("category, sort_order")
    .eq("project_id", projectId)
    .order("sort_order");

  if (error) {
    // Table might not exist yet — return empty so app still works
    console.warn("getCategoryOrders:", error.message);
    return {};
  }

  const map: Record<string, number> = {};
  for (const row of data ?? []) {
    map[row.category] = row.sort_order;
  }
  return map;
}

export async function saveCategoryOrders(projectId: string, categories: string[]) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");

  // Delete existing orders for this project+user
  await supabase
    .from("budget_category_orders")
    .delete()
    .eq("project_id", projectId)
    .eq("user_id", user.id);

  // Insert new order
  const rows = categories.map((category, i) => ({
    project_id: projectId,
    user_id: user.id,
    category,
    sort_order: i,
  }));

  const { error } = await supabase
    .from("budget_category_orders")
    .insert(rows);

  if (error) throw error;
  revalidatePath(`/projects/${projectId}/budget`);
}

export async function saveBudgetItemOrder(projectId: string, itemIds: string[]) {
  const supabase = await createClient();

  // Update sort_order for each item
  const updates = itemIds.map((id, i) =>
    supabase
      .from("budget_items")
      .update({ sort_order: i, updated_at: new Date().toISOString() })
      .eq("id", id)
  );

  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;

  revalidatePath(`/projects/${projectId}/budget`);
}

export async function deleteBudgetItem(projectId: string, itemId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("budget_items").delete().eq("id", itemId);
  if (error) throw error;
  revalidatePath(`/projects/${projectId}/budget`);
  revalidatePath(`/projects/${projectId}`);
}
