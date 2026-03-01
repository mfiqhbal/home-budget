"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { PriorityBadge } from "@/components/shared/priority-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Check, X, GitCompareArrows } from "lucide-react";
import { createBudgetItem, updateBudgetItem, deleteBudgetItem, getOrCreateComparison } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

const CATEGORIES = [
  "Kitchen", "Bathroom", "Bedroom", "Living Room", "Wiring",
  "Plumbing", "Flooring", "Painting", "Furniture", "Appliances",
  "Exterior", "Other",
];

interface BudgetItemRow {
  id: string;
  category: string;
  type: string | null;
  item_name: string;
  estimate_amount: string | null;
  actual_amount: string | null;
  priority: number;
  notes: string | null;
}

interface LinkedComparison {
  comparisonId: string;
  comparisonName: string;
  selectedProduct?: string;
  selectedCost?: string;
  supplierName?: string;
}

interface BudgetTableProps {
  grouped: Record<string, BudgetItemRow[]>;
  projectId: string;
  currency: string;
  totalEstimate: number;
  totalActual: number;
  linkedComparisons?: Record<string, LinkedComparison>;
}

// Inline editable cell
function EditableCell({
  value,
  onSave,
  type = "text",
  className = "",
  placeholder = "",
}: {
  value: string;
  onSave: (val: string) => void;
  type?: "text" | "number";
  className?: string;
  placeholder?: string;
}) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  function commit() {
    if (draft !== value) onSave(draft);
    setEditing(false);
  }

  function cancel() {
    setDraft(value);
    setEditing(false);
  }

  if (!editing) {
    return (
      <span
        className={`cursor-pointer hover:bg-white/40 rounded px-1.5 py-0.5 -mx-1.5 transition-colors ${className}`}
        onClick={() => { setDraft(value); setEditing(true); }}
        title="Click to edit"
      >
        {value || <span className="text-muted-foreground/50 italic">{placeholder || "—"}</span>}
      </span>
    );
  }

  return (
    <input
      ref={inputRef}
      type={type}
      step={type === "number" ? "0.01" : undefined}
      value={draft}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") commit();
        if (e.key === "Escape") cancel();
        if (e.key === "Tab") commit();
      }}
      className="glass-input rounded px-1.5 py-0.5 text-sm w-full outline-none border border-primary/30 focus:border-primary"
    />
  );
}

// Priority cycle button
function PriorityCycle({ priority, onSave }: { priority: number; onSave: (p: number) => void }) {
  function cycle() {
    const next = priority === 1 ? 2 : priority === 2 ? 3 : 1;
    onSave(next);
  }
  return (
    <button onClick={cycle} title="Click to cycle priority">
      <PriorityBadge priority={priority} className="cursor-pointer hover:opacity-80" />
    </button>
  );
}

// Compare button - creates or navigates to comparison
function CompareButton({
  projectId,
  budgetItemId,
  linked,
}: {
  projectId: string;
  budgetItemId: string;
  linked?: LinkedComparison;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    if (linked) {
      router.push(`/projects/${projectId}/comparisons/${linked.comparisonId}`);
      return;
    }
    setLoading(true);
    try {
      const comparisonId = await getOrCreateComparison(projectId, budgetItemId);
      router.push(`/projects/${projectId}/comparisons/${comparisonId}`);
    } catch {
      toast.error("Failed to open comparison");
    } finally {
      setLoading(false);
    }
  }

  const hasSelected = !!linked?.selectedProduct;

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`inline-flex items-center justify-center h-7 w-7 rounded-md transition-colors ${
        hasSelected
          ? "bg-primary/10 text-primary hover:bg-primary/20"
          : linked
            ? "text-primary/60 hover:bg-primary/10 hover:text-primary"
            : "text-muted-foreground/40 hover:bg-muted/30 hover:text-muted-foreground opacity-0 group-hover:opacity-100"
      }`}
      title={
        hasSelected
          ? `${linked.selectedProduct} - Click to view comparison`
          : linked
            ? `${linked.comparisonName} - Click to view`
            : "Compare products"
      }
    >
      <GitCompareArrows className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
    </button>
  );
}

// Quick add row
function QuickAddRow({
  projectId,
  category,
  onAdded,
}: {
  projectId: string;
  category: string;
  onAdded: () => void;
}) {
  const [active, setActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    itemName: "",
    type: "",
    estimateAmount: "",
    actualAmount: "",
    priority: "3",
    notes: "",
  });

  function reset() {
    setForm({ itemName: "", type: "", estimateAmount: "", actualAmount: "", priority: "3", notes: "" });
    setActive(false);
  }

  async function save() {
    if (!form.itemName.trim()) { toast.error("Item name required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("category", category);
      fd.set("itemName", form.itemName);
      fd.set("type", form.type);
      fd.set("estimateAmount", form.estimateAmount || "0");
      fd.set("actualAmount", form.actualAmount || "0");
      fd.set("priority", form.priority);
      fd.set("notes", form.notes);
      await createBudgetItem(projectId, fd);
      toast.success("Item added");
      reset();
      onAdded();
    } catch {
      toast.error("Failed to add item");
    } finally {
      setSaving(false);
    }
  }

  if (!active) {
    return (
      <TableRow>
        <TableCell colSpan={7}>
          <button
            onClick={() => { setActive(true); setTimeout(() => nameRef.current?.focus(), 50); }}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors py-1"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item to {category}
          </button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-primary/5">
      <TableCell>
        <input
          ref={nameRef}
          value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") reset(); }}
          placeholder="Item name *"
          className="glass-input rounded px-1.5 py-1 text-sm w-full outline-none border border-primary/30 focus:border-primary"
        />
      </TableCell>
      <TableCell>
        <input
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") reset(); }}
          placeholder="Type"
          className="glass-input rounded px-1.5 py-1 text-sm w-full outline-none border border-primary/30 focus:border-primary"
        />
      </TableCell>
      <TableCell>
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="glass-input rounded px-1.5 py-1 text-sm outline-none border border-primary/30"
        >
          <option value="1">P1</option>
          <option value="2">P2</option>
          <option value="3">P3</option>
        </select>
      </TableCell>
      <TableCell>
        <input
          type="number"
          step="0.01"
          value={form.estimateAmount}
          onChange={(e) => setForm({ ...form, estimateAmount: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") reset(); }}
          placeholder="0.00"
          className="glass-input rounded px-1.5 py-1 text-sm w-full text-right outline-none border border-primary/30 focus:border-primary font-mono"
        />
      </TableCell>
      <TableCell>
        <input
          type="number"
          step="0.01"
          value={form.actualAmount}
          onChange={(e) => setForm({ ...form, actualAmount: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") reset(); }}
          placeholder="0.00"
          className="glass-input rounded px-1.5 py-1 text-sm w-full text-right outline-none border border-primary/30 focus:border-primary font-mono"
        />
      </TableCell>
      <TableCell />
      <TableCell>
        <div className="flex gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-primary" onClick={save} disabled={saving}>
            <Check className="w-4 h-4" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7 text-muted-foreground" onClick={reset}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}

export function BudgetTable({ grouped, projectId, currency, totalEstimate, totalActual, linkedComparisons = {} }: BudgetTableProps) {
  const router = useRouter();

  const refresh = useCallback(() => router.refresh(), [router]);

  async function handleInlineUpdate(item: BudgetItemRow, field: string, value: string) {
    const fd = new FormData();
    fd.set("category", item.category);
    fd.set("type", field === "type" ? value : (item.type || ""));
    fd.set("itemName", field === "item_name" ? value : item.item_name);
    fd.set("estimateAmount", field === "estimate_amount" ? value : (item.estimate_amount || "0"));
    fd.set("actualAmount", field === "actual_amount" ? value : (item.actual_amount || "0"));
    fd.set("priority", field === "priority" ? value : String(item.priority));
    fd.set("notes", field === "notes" ? value : (item.notes || ""));

    try {
      await updateBudgetItem(projectId, item.id, fd);
      refresh();
    } catch {
      toast.error("Failed to update");
    }
  }

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteBudgetItem(projectId, itemId);
      toast.success("Deleted");
      refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const categories = Object.keys(grouped).sort();

  if (categories.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <p className="text-muted-foreground mb-4">No budget items yet.</p>
        <NewCategoryRow projectId={projectId} onAdded={refresh} />
      </GlassCard>
    );
  }

  return (
    <div className="space-y-6">
      {categories.map((category) => {
        const items = grouped[category];
        const catEstimate = items.reduce((s, i) => s + parseFloat(i.estimate_amount || "0"), 0);
        const catActual = items.reduce((s, i) => s + parseFloat(i.actual_amount || "0"), 0);

        return (
          <GlassCard key={category} className="p-0 overflow-hidden">
            <div className="px-6 py-3 border-b border-white/20">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{category}</h3>
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    Est: <span className="font-mono">{formatCurrency(catEstimate, currency)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Act: <span className="font-mono">{formatCurrency(catActual, currency)}</span>
                  </span>
                </div>
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%]">Item</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-[60px]">Pri</TableHead>
                  <TableHead className="text-right">Estimate</TableHead>
                  <TableHead className="text-right">Actual</TableHead>
                  <TableHead className="w-[40px]" />
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const linked = linkedComparisons[item.id];
                  return (
                    <TableRow key={item.id} className="group">
                      <TableCell>
                        <EditableCell
                          value={item.item_name}
                          onSave={(v) => handleInlineUpdate(item, "item_name", v)}
                          placeholder="Item name"
                          className="font-medium"
                        />
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 px-1.5">{item.notes}</p>
                        )}
                        {/* Show selected product info */}
                        {linked?.selectedProduct && (
                          <p className="text-xs text-primary/70 mt-0.5 px-1.5 truncate">
                            {linked.selectedProduct}
                            {linked.supplierName ? ` (${linked.supplierName})` : ""}
                          </p>
                        )}
                      </TableCell>
                      <TableCell>
                        <EditableCell
                          value={item.type || ""}
                          onSave={(v) => handleInlineUpdate(item, "type", v)}
                          placeholder="Type"
                          className="text-muted-foreground"
                        />
                      </TableCell>
                      <TableCell>
                        <PriorityCycle
                          priority={item.priority}
                          onSave={(p) => handleInlineUpdate(item, "priority", String(p))}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <EditableCell
                          value={item.estimate_amount || "0"}
                          onSave={(v) => handleInlineUpdate(item, "estimate_amount", v)}
                          type="number"
                          className="font-mono text-right"
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <EditableCell
                          value={item.actual_amount || "0"}
                          onSave={(v) => handleInlineUpdate(item, "actual_amount", v)}
                          type="number"
                          className="font-mono text-right"
                        />
                      </TableCell>
                      <TableCell>
                        <CompareButton
                          projectId={projectId}
                          budgetItemId={item.id}
                          linked={linked}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleDelete(item.id)}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                <QuickAddRow projectId={projectId} category={category} onAdded={refresh} />
              </TableBody>
            </Table>
          </GlassCard>
        );
      })}

      {/* Add new category */}
      <NewCategoryRow projectId={projectId} onAdded={refresh} />

      {/* Totals */}
      <GlassCard>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-lg">Total</span>
          <div className="flex gap-8">
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Estimate</p>
              <CurrencyDisplay amount={totalEstimate} currency={currency} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Actual</p>
              <CurrencyDisplay amount={totalActual} currency={currency} size="lg" />
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Difference</p>
              <CurrencyDisplay amount={totalEstimate - totalActual} currency={currency} size="lg" />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// Component to add first item with new category
function NewCategoryRow({ projectId, onAdded }: { projectId: string; onAdded: () => void }) {
  const [active, setActive] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "", itemName: "", estimateAmount: "", actualAmount: "" });

  async function save() {
    if (!form.category || !form.itemName) { toast.error("Category and item name required"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.set("category", form.category);
      fd.set("itemName", form.itemName);
      fd.set("type", "");
      fd.set("estimateAmount", form.estimateAmount || "0");
      fd.set("actualAmount", form.actualAmount || "0");
      fd.set("priority", "3");
      fd.set("notes", "");
      await createBudgetItem(projectId, fd);
      toast.success("Item added");
      setForm({ category: "", itemName: "", estimateAmount: "", actualAmount: "" });
      setActive(false);
      onAdded();
    } catch {
      toast.error("Failed to add");
    } finally {
      setSaving(false);
    }
  }

  if (!active) {
    return (
      <GlassCard className="border-dashed border-2 border-primary/20 bg-transparent text-center py-4 cursor-pointer hover:border-primary/40 transition-colors" onClick={() => setActive(true)}>
        <span className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground">
          <Plus className="w-4 h-4" />
          Add new category
        </span>
      </GlassCard>
    );
  }

  return (
    <GlassCard>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="glass-input rounded px-2 py-1.5 text-sm w-full outline-none border border-primary/30"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Item Name *</label>
          <input
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setActive(false); }}
            placeholder="Item name"
            className="glass-input rounded px-2 py-1.5 text-sm w-full outline-none border border-primary/30 focus:border-primary"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Estimate</label>
          <input
            type="number" step="0.01"
            value={form.estimateAmount}
            onChange={(e) => setForm({ ...form, estimateAmount: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            placeholder="0.00"
            className="glass-input rounded px-2 py-1.5 text-sm w-full text-right outline-none border border-primary/30 focus:border-primary font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block">Actual</label>
          <input
            type="number" step="0.01"
            value={form.actualAmount}
            onChange={(e) => setForm({ ...form, actualAmount: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            placeholder="0.00"
            className="glass-input rounded px-2 py-1.5 text-sm w-full text-right outline-none border border-primary/30 focus:border-primary font-mono"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button size="sm" onClick={save} disabled={saving} className="flex-1">
            <Check className="w-3.5 h-3.5 mr-1" />{saving ? "..." : "Add"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setActive(false)}>
            <X className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </GlassCard>
  );
}
