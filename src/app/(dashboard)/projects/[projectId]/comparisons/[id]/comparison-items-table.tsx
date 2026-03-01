"use client";

import { useState, useEffect } from "react";
import { GlassCard } from "@/components/shared/glass-card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, ExternalLink, Check, RefreshCw } from "lucide-react";
import { deleteComparisonItem, toggleComparisonItemSelected } from "../actions";
import { fetchLinkPreview } from "./link-preview";
import { ComparisonItemDialog } from "./comparison-item-dialog";
import { ImageUpload } from "@/components/shared/image-upload";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import Image from "next/image";

interface ComparisonItemsTableProps {
  items: Array<{
    id: string;
    product_name: string;
    price: string | null;
    quantity: number | null;
    transport_cost: string | null;
    total_cost: string | null;
    link: string | null;
    link_image: string | null;
    link_title: string | null;
    supplier_id: string | null;
    suppliers: { name: string } | null;
    remark: string | null;
    is_selected: boolean | null;
  }>;
  projectId: string;
  comparisonId: string;
  suppliers: Array<{ id: string; name: string }>;
}

function LinkPreviewImage({
  item,
  projectId,
  comparisonId,
}: {
  item: ComparisonItemsTableProps["items"][0];
  projectId: string;
  comparisonId: string;
}) {
  const [image, setImage] = useState<string | null>(item.link_image);
  const [loading, setLoading] = useState(false);

  // Auto-fetch if link exists but no cached image
  useEffect(() => {
    if (item.link && !item.link_image && !loading) {
      handleFetch();
    }
  }, [item.link, item.link_image]);

  async function handleFetch() {
    if (!item.link) return;
    setLoading(true);
    try {
      const result = await fetchLinkPreview(projectId, comparisonId, item.id, item.link);
      if (result.image) {
        setImage(result.image);
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }

  if (!item.link) return null;

  if (loading) {
    return (
      <div className="w-full aspect-[4/3] rounded-lg bg-black/5 flex items-center justify-center mb-3">
        <RefreshCw className="w-5 h-5 text-muted-foreground animate-spin" />
      </div>
    );
  }

  if (image) {
    return (
      <a href={item.link} target="_blank" rel="noopener noreferrer" className="block mb-3">
        <div className="relative w-full aspect-[4/3] rounded-lg overflow-hidden bg-black/5 group/img">
          <Image
            src={image}
            alt={item.product_name}
            fill
            className="object-contain transition-transform duration-300 group-hover/img:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            unoptimized
          />
          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/10 transition-colors flex items-center justify-center">
            <ExternalLink className="w-5 h-5 text-white opacity-0 group-hover/img:opacity-100 transition-opacity drop-shadow-lg" />
          </div>
        </div>
      </a>
    );
  }

  // No image found - show retry button
  return (
    <div className="w-full aspect-[4/3] rounded-lg bg-black/5 flex flex-col items-center justify-center mb-3 gap-2">
      <p className="text-xs text-muted-foreground">No preview</p>
      <button
        onClick={handleFetch}
        className="text-xs text-primary hover:text-primary/80 flex items-center gap-1"
      >
        <RefreshCw className="w-3 h-3" />
        Retry
      </button>
    </div>
  );
}

export function ComparisonItemsTable({ items, projectId, comparisonId, suppliers }: ComparisonItemsTableProps) {
  const router = useRouter();

  async function handleDelete(itemId: string) {
    if (!confirm("Delete this item?")) return;
    try {
      await deleteComparisonItem(projectId, comparisonId, itemId);
      toast.success("Item deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  async function handleToggleSelect(itemId: string, current: boolean) {
    try {
      await toggleComparisonItemSelected(projectId, comparisonId, itemId, !current);
      router.refresh();
    } catch {
      toast.error("Failed to update");
    }
  }

  if (items.length === 0) {
    return (
      <GlassCard className="text-center py-12">
        <p className="text-muted-foreground">No items to compare yet. Add products to start comparing.</p>
      </GlassCard>
    );
  }

  // Side-by-side card view
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <GlassCard
          key={item.id}
          className={`relative ${item.is_selected ? "ring-2 ring-primary" : ""}`}
        >
          {item.is_selected && (
            <Badge className="absolute top-3 right-3 bg-primary z-10">Selected</Badge>
          )}

          {/* Link preview image */}
          <LinkPreviewImage
            item={item}
            projectId={projectId}
            comparisonId={comparisonId}
          />

          <h3 className="font-semibold text-lg mb-3 pr-16">{item.product_name}</h3>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Unit Price</span>
              <CurrencyDisplay amount={item.price || "0"} size="sm" />
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Quantity</span>
              <span>{item.quantity || 1}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Transport</span>
              <CurrencyDisplay amount={item.transport_cost || "0"} size="sm" />
            </div>
            <div className="flex justify-between border-t border-white/20 pt-2 font-semibold">
              <span>Total</span>
              <CurrencyDisplay amount={item.total_cost || "0"} size="sm" />
            </div>
          </div>

          {item.suppliers?.name && (
            <p className="text-xs text-muted-foreground mt-3">
              Supplier: {item.suppliers.name}
            </p>
          )}

          {item.remark && (
            <p className="text-xs text-muted-foreground mt-1 italic">{item.remark}</p>
          )}

          {/* Image upload for this comparison item */}
          <div className="mt-3">
            <ImageUpload entityType="comparison_item" entityId={item.id} />
          </div>

          <div className="flex items-center gap-1 mt-4 pt-3 border-t border-white/20">
            <Button
              variant={item.is_selected ? "default" : "outline"}
              size="sm"
              onClick={() => handleToggleSelect(item.id, !!item.is_selected)}
            >
              <Check className="w-3 h-3 mr-1" />
              {item.is_selected ? "Selected" : "Select"}
            </Button>

            {item.link && (
              <a href={item.link} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </a>
            )}

            <ComparisonItemDialog
              projectId={projectId}
              comparisonId={comparisonId}
              suppliers={suppliers}
              mode="edit"
              item={{
                id: item.id,
                productName: item.product_name,
                price: item.price || "0",
                quantity: item.quantity || 1,
                transportCost: item.transport_cost || "0",
                link: item.link || "",
                supplierId: item.supplier_id || "",
                remark: item.remark || "",
                isSelected: !!item.is_selected,
              }}
            />

            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive ml-auto" onClick={() => handleDelete(item.id)}>
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </GlassCard>
      ))}
    </div>
  );
}
