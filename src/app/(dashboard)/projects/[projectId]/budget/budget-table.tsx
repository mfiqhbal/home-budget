"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { PriorityBadge } from "@/components/shared/priority-badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { Trash2, Plus, Check, X, GitCompareArrows, GripVertical, ChevronsUpDown, ChevronDown, ChevronRight } from "lucide-react";
import { createBudgetItem, updateBudgetItem, deleteBudgetItem, getOrCreateComparison, saveCategoryOrders } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

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
  categoryOrders?: Record<string, number>;
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

// Priority selector popover
function PriorityPicker({ priority, onSave }: { priority: number; onSave: (p: number) => void }) {
  const [open, setOpen] = useState(false);
  const p = Number(priority);

  function select(val: number) {
    if (val !== p) onSave(val);
    setOpen(false);
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button title="Click to change priority">
          <PriorityBadge priority={p} className="cursor-pointer hover:opacity-80" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="bottom" align="start" className="w-auto p-1.5 flex gap-1">
        {[1, 2, 3].map((val) => (
          <button
            key={val}
            onClick={() => select(val)}
            className={`rounded-md px-1 py-0.5 transition-colors ${val === p ? "ring-1 ring-copper" : "hover:bg-muted/50"}`}
          >
            <PriorityBadge priority={val} className="cursor-pointer" />
          </button>
        ))}
      </PopoverContent>
    </Popover>
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

// Popover form for adding new category from the Total bar
function AddCategoryPopover({ projectId, onAdded }: { projectId: string; onAdded: () => void }) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ category: "", itemName: "", estimateAmount: "", actualAmount: "" });

  function reset() {
    setForm({ category: "", itemName: "", estimateAmount: "", actualAmount: "" });
  }

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
      reset();
      setOpen(false);
      onAdded();
    } catch {
      toast.error("Failed to add");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Popover open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <PopoverTrigger asChild>
        <button
          className="h-7 w-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
          title="Add new category"
        >
          <Plus className="w-4 h-4" />
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" className="w-80">
        <div className="space-y-3">
          <p className="text-sm font-heading font-semibold">Add new category</p>
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
              onKeyDown={(e) => { if (e.key === "Enter") save(); }}
              placeholder="First item in this category"
              className="glass-input rounded px-2 py-1.5 text-sm w-full outline-none border border-copper/30 focus:border-copper"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
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
          </div>
          <div className="flex gap-2 pt-1">
            <Button size="sm" onClick={save} disabled={saving} className="flex-1">
              <Check className="w-3.5 h-3.5 mr-1" />{saving ? "..." : "Add"}
            </Button>
            <Button size="sm" variant="outline" onClick={() => setOpen(false)}>
              <X className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

// Sortable wrapper for a category card
function SortableCategoryCard({
  category,
  items,
  currency,
  projectId,
  linkedComparisons,
  onInlineUpdate,
  onDelete,
  onAdded,
  collapsed,
  onToggleCollapse,
}: {
  category: string;
  items: BudgetItemRow[];
  currency: string;
  projectId: string;
  linkedComparisons: Record<string, LinkedComparison>;
  onInlineUpdate: (item: BudgetItemRow, field: string, value: string) => void;
  onDelete: (itemId: string) => void;
  onAdded: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : undefined,
    opacity: isDragging ? 0.85 : undefined,
  };

  const catEstimate = items.reduce((s, i) => s + parseFloat(i.estimate_amount || "0"), 0);
  const catActual = items.reduce((s, i) => s + parseFloat(i.actual_amount || "0"), 0);
  const catRatio = catEstimate > 0 ? Math.min((catActual / catEstimate) * 100, 150) : 0;

  return (
    <div ref={setNodeRef} style={style}>
      <GlassCard className="p-0 overflow-hidden">
        <div className="px-6 py-3 border-b border-border/20 bg-gradient-to-r from-copper/[0.03] to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <button
                className="cursor-grab active:cursor-grabbing text-muted-foreground/40 hover:text-muted-foreground transition-colors touch-none"
                {...attributes}
                {...listeners}
                title="Drag to reorder"
              >
                <GripVertical className="w-4 h-4" />
              </button>
              <button
                onClick={onToggleCollapse}
                className="text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                title={collapsed ? "Expand" : "Collapse"}
              >
                {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <h3 className="font-heading font-semibold">{category}</h3>
              {collapsed && (
                <span className="text-xs text-muted-foreground/50 ml-1 font-body">{items.length} items</span>
              )}
            </div>
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
        {!collapsed && (
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
                        onSave={(v) => onInlineUpdate(item, "item_name", v)}
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
                        onSave={(v) => onInlineUpdate(item, "type", v)}
                        placeholder="Type"
                        className="text-muted-foreground"
                      />
                    </TableCell>
                    <TableCell>
                      <PriorityPicker
                        priority={item.priority}
                        onSave={(p) => onInlineUpdate(item, "priority", String(p))}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.estimate_amount || "0"}
                        onSave={(v) => onInlineUpdate(item, "estimate_amount", v)}
                        type="number"
                        className="font-mono text-right"
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <EditableCell
                        value={item.actual_amount || "0"}
                        onSave={(v) => onInlineUpdate(item, "actual_amount", v)}
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
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
              <QuickAddRow projectId={projectId} category={category} onAdded={onAdded} />
            </TableBody>
          </Table>
        )}
      </GlassCard>
    </div>
  );
}

export function BudgetTable({ grouped, projectId, currency, totalEstimate, totalActual, linkedComparisons = {}, categoryOrders = {} }: BudgetTableProps) {
  const router = useRouter();

  const refresh = useCallback(() => router.refresh(), [router]);

  // Sort categories using saved order, falling back to alphabetical for new ones
  const sortedInitial = Object.keys(grouped).sort((a, b) => {
    const orderA = categoryOrders[a] ?? Infinity;
    const orderB = categoryOrders[b] ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;
    return a.localeCompare(b);
  });

  const [categories, setCategories] = useState<string[]>(sortedInitial);

  // Sync when grouped changes (e.g. new category added)
  useEffect(() => {
    const newKeys = Object.keys(grouped);
    setCategories((prev) => {
      const existing = prev.filter((c) => newKeys.includes(c));
      const added = newKeys.filter((c) => !prev.includes(c)).sort();
      return [...existing, ...added];
    });
  }, [grouped]);

  const [collapsedSet, setCollapsedSet] = useState<Set<string>>(new Set());

  const allCollapsed = categories.length > 0 && categories.every((c) => collapsedSet.has(c));

  function toggleCollapse(cat: string) {
    setCollapsedSet((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  function toggleAll() {
    if (allCollapsed) {
      setCollapsedSet(new Set());
    } else {
      setCollapsedSet(new Set(categories));
    }
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = categories.indexOf(active.id as string);
    const newIndex = categories.indexOf(over.id as string);
    const reordered = arrayMove(categories, oldIndex, newIndex);
    setCategories(reordered);

    try {
      await saveCategoryOrders(projectId, reordered);
    } catch {
      toast.error("Failed to save order");
    }
  }

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
            {/* Left: label + add button + progress bar */}
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-heading font-semibold text-white text-sm shrink-0">Total</span>
              <AddCategoryPopover projectId={projectId} onAdded={refresh} />
              <button
                onClick={toggleAll}
                className="h-7 w-7 rounded-md flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                title={allCollapsed ? "Expand all" : "Collapse all"}
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>
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

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={categories} strategy={verticalListSortingStrategy}>
          {categories.map((category) => {
            const items = grouped[category];
            if (!items) return null;
            return (
              <SortableCategoryCard
                key={category}
                category={category}
                items={items}
                currency={currency}
                projectId={projectId}
                linkedComparisons={linkedComparisons}
                onInlineUpdate={handleInlineUpdate}
                onDelete={handleDelete}
                onAdded={refresh}
                collapsed={collapsedSet.has(category)}
                onToggleCollapse={() => toggleCollapse(category)}
              />
            );
          })}
        </SortableContext>
      </DndContext>

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
