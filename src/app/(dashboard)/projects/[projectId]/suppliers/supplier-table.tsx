"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Phone, Mail, Globe } from "lucide-react";
import { SupplierDialog } from "./supplier-dialog";
import { deleteSupplier } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SupplierTableProps {
  suppliers: Array<{
    id: string;
    name: string;
    phone: string | null;
    email: string | null;
    website: string | null;
    products: string | null;
    pricing: string | null;
    notes: string | null;
  }>;
  projectId: string;
}

function getInitialsBg(name: string) {
  const colors = [
    "bg-primary/15 text-primary",
    "bg-copper/15 text-copper",
    "bg-emerald-500/15 text-emerald-600",
    "bg-amber-500/15 text-amber-600",
    "bg-blue-500/15 text-blue-600",
    "bg-violet-500/15 text-violet-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export function SupplierTable({ suppliers, projectId }: SupplierTableProps) {
  const router = useRouter();

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete supplier "${name}"?`)) return;
    try {
      await deleteSupplier(projectId, id);
      toast.success("Supplier deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {suppliers.map((s) => {
        const initials = s.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
        const avatarColor = getInitialsBg(s.name);

        return (
          <GlassCard key={s.id} className="group hover:shadow-lg hover:shadow-copper/5 transition-all">
            <div className="flex items-start gap-3 mb-3">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor}`}>
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold truncate">{s.name}</h3>
                {s.products && (
                  <p className="text-xs text-muted-foreground font-body mt-0.5 line-clamp-1">{s.products}</p>
                )}
              </div>
            </div>

            {/* Contact pills */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {s.phone && (
                <a href={`tel:${s.phone}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
                  <Phone className="w-3 h-3" />{s.phone}
                </a>
              )}
              {s.email && (
                <a href={`mailto:${s.email}`} className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-muted-foreground hover:text-foreground transition-colors font-body">
                  <Mail className="w-3 h-3" />{s.email}
                </a>
              )}
              {s.website && (
                <a href={s.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-muted/50 text-xs text-copper hover:text-copper/80 transition-colors font-body">
                  <Globe className="w-3 h-3" />Website
                </a>
              )}
            </div>

            {s.notes && (
              <p className="text-sm text-muted-foreground font-body line-clamp-2 mb-3">{s.notes}</p>
            )}

            {/* Actions */}
            <div className="flex gap-1 justify-end pt-2 border-t border-border/20 opacity-0 group-hover:opacity-100 transition-opacity">
              <SupplierDialog
                projectId={projectId}
                mode="edit"
                supplier={{
                  id: s.id,
                  name: s.name,
                  phone: s.phone || "",
                  email: s.email || "",
                  website: s.website || "",
                  products: s.products || "",
                  pricing: s.pricing || "",
                  notes: s.notes || "",
                }}
              />
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(s.id, s.name)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </GlassCard>
        );
      })}
    </div>
  );
}
