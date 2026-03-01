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
        className={`cursor-pointer hover:bg-copper/5 rounded px-1.5 py-0.5 -mx-1.5 transition-colors ${className}`}
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
      className="glass-input rounded px-1.5 py-0.5 text-sm w-full outline-none border border-copper/30 focus:border-copper"
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
          ? "bg-copper/10 text-copper hover:bg-copper/20"
          : linked
            ? "text-copper/60 hover:bg-copper/10 hover:text-copper"
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
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-copper transition-colors py-1 font-body"
          >
            <Plus className="w-3.5 h-3.5" />
            Add item to {category}
          </button>
        </TableCell>
      </TableRow>
    );
  }

  return (
    <TableRow className="bg-copper/5">
      <TableCell>
        <input
          ref={nameRef}
          value={form.itemName}
          onChange={(e) => setForm({ ...form, itemName: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") reset(); }}
          placeholder="Item name *"
          className="glass-input rounded px-1.5 py-1 text-sm w-full outline-none border border-copper/30 focus:border-copper"
        />
      </TableCell>
      <TableCell>
        <input
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value })}
          onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") reset(); }}
          placeholder="Type"
          className="glass-input rounded px-1.5 py-1 text-sm w-full outline-none border border-copper/30 focus:border-copper"
        />
      </TableCell>
      <TableCell>
        <select
          value={form.priority}
          onChange={(e) => setForm({ ...form, priority: e.target.value })}
          className="glass-input rounded px-1.5 py-1 text-sm outline-none border border-copper/30"
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
          className="glass-input rounded px-1.5 py-1 text-sm w-full text-right outline-none border border-copper/30 focus:border-copper font-mono"
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
          className="glass-input rounded px-1.5 py-1 text-sm w-full text-right outline-none border border-copper/30 focus:border-copper font-mono"
        />
      </TableCell>
      <TableCell />
      <TableCell>
        <div className="flex gap-1 justify-end">
          <Button size="icon" variant="ghost" className="h-7 w-7 text-copper" onClick={save} disabled={saving}>
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
        <p className="text-muted-foreground mb-4 font-body">No budget items yet.</p>
        <NewCategoryRow projectId={projectId} onAdded={refresh} />
      </GlassCard>
    );
  }

  const difference = totalEstimate - totalActual;
  const utilization = totalEstimate > 0 ? Math.min((totalActual / totalEstimate) * 100, 100) : 0;

  return (
    <div className="space-y-6 pb-24">
      {/* Sticky totals bar */}
      <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none">
        <div className="md:ml-64 pointer-events-auto">
          <div
            className="mx-4 md:mx-6 mb-4 rounded-xl px-5 py-3 flex items-center justify-between gap-4"
            style={{
              background: "rgba(30, 30, 42, 0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 -4px 30px rgba(0,0,0,0.15)",
            }}
          >
            {/* Left: label + progress bar */}
            <div className="flex items-center gap-4 min-w-0">
              <span className="font-heading font-semibold text-white text-sm shrink-0">Total</span>
              <div className="hidden sm:flex items-center gap-2 min-w-0">
                <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.1)" }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${utilization}%`,
                      background: utilization > 100 ? "#EF4444" : utilization > 80 ? "#F59E0B" : "#10B981",
                    }}
                  />
                </div>
                <span className="text-xs font-mono" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {Math.round(utilization)}%
                </span>
              </div>
            </div>

            {/* Right: numbers */}
            <div className="flex items-center gap-5 md:gap-8 shrink-0">
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Estimate</p>
                <CurrencyDisplay amount={totalEstimate} currency={currency} size="sm" className="text-white font-semibold" />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>Actual</p>
                <CurrencyDisplay amount={totalActual} currency={currency} size="sm" className="text-white font-semibold" />
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(255,255,255,0.4)" }}>
                  {difference >= 0 ? "Remaining" : "Over"}
                </p>
                <CurrencyDisplay
                  amount={Math.abs(difference)}
                  currency={currency}
                  size="sm"
                  className={`font-semibold ${difference >= 0 ? "text-emerald-400" : "text-red-400"}`}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {categories.map((category) => {
        const items = grouped[category];
        const catEstimate = items.reduce((s, i) => s + parseFloat(i.estimate_amount || "0"), 0);
        const catActual = items.reduce((s, i) => s + parseFloat(i.actual_amount || "0"), 0);
        const catRatio = catEstimate > 0 ? Math.min((catActual / catEstimate) * 100, 150) : 0;

        return (
          <GlassCard key={category} className="p-0 overflow-hidden">
            <div className="px-6 py-3 border-b border-border/20 bg-gradient-to-r from-copper/[0.03] to-transparent">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-semibold">{category}</h3>
                <div className="flex gap-4 text-sm font-body">
                  <span className="text-muted-foreground">
                    Est: <span className="font-mono">{formatCurrency(catEstimate, currency)}</span>
                  </span>
                  <span className="text-muted-foreground">
                    Act: <span className="font-mono">{formatCurrency(catActual, currency)}</span>
                  </span>
                </div>
              </div>
              {/* Category progress bar */}
              <div className="mt-2 h-1 rounded-full bg-muted/50 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    catRatio > 100 ? "bg-destructive" : catRatio > 80 ? "bg-amber-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(catRatio, 100)}%` }}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[28%] font-body">Item</TableHead>
                  <TableHead className="font-body">Type</TableHead>
                  <TableHead className="w-[60px] font-body">Pri</TableHead>
                  <TableHead className="text-right font-body">Estimate</TableHead>
                  <TableHead className="text-right font-body">Actual</TableHead>
                  <TableHead className="w-[40px]" />
                  <TableHead className="w-[50px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => {
                  const linked = linkedComparisons[item.id];
                  const est = parseFloat(item.estimate_amount || "0");
                  const act = parseFloat(item.actual_amount || "0");
                  const overBudget = est > 0 && act > est;
                  const nearBudget = est > 0 && act > est * 0.8 && act <= est;

                  return (
                    <TableRow key={item.id} className="group hover:bg-copper/[0.02]">
                      <TableCell>
                        <EditableCell
                          value={item.item_name}
                          onSave={(v) => handleInlineUpdate(item, "item_name", v)}
                          placeholder="Item name"
                          className="font-medium"
                        />
                        {item.notes && (
                          <p className="text-xs text-muted-foreground mt-0.5 px-1.5 font-body">{item.notes}</p>
                        )}
                        {linked?.selectedProduct && (
                          <p className="text-xs text-copper/70 mt-0.5 px-1.5 truncate font-body">
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
                          className={`font-mono text-right ${
                            overBudget ? "text-destructive" : nearBudget ? "text-amber-600" : ""
                          }`}
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
      <GlassCard className="border-dashed border-2 border-copper/20 bg-transparent text-center py-4 cursor-pointer hover:border-copper/40 transition-colors" onClick={() => setActive(true)}>
        <span className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground font-body">
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
          <label className="text-xs text-muted-foreground mb-1 block font-body">Category *</label>
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="glass-input rounded px-2 py-1.5 text-sm w-full outline-none border border-copper/30"
          >
            <option value="">Select...</option>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block font-body">Item Name *</label>
          <input
            value={form.itemName}
            onChange={(e) => setForm({ ...form, itemName: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") save(); if (e.key === "Escape") setActive(false); }}
            placeholder="Item name"
            className="glass-input rounded px-2 py-1.5 text-sm w-full outline-none border border-copper/30 focus:border-copper"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block font-body">Estimate</label>
          <input
            type="number" step="0.01"
            value={form.estimateAmount}
            onChange={(e) => setForm({ ...form, estimateAmount: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            placeholder="0.00"
            className="glass-input rounded px-2 py-1.5 text-sm w-full text-right outline-none border border-copper/30 focus:border-copper font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground mb-1 block font-body">Actual</label>
          <input
            type="number" step="0.01"
            value={form.actualAmount}
            onChange={(e) => setForm({ ...form, actualAmount: e.target.value })}
            onKeyDown={(e) => { if (e.key === "Enter") save(); }}
            placeholder="0.00"
            className="glass-input rounded px-2 py-1.5 text-sm w-full text-right outline-none border border-copper/30 focus:border-copper font-mono"
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
