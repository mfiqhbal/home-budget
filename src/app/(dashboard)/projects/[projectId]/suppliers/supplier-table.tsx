"use client";

import { GlassCard } from "@/components/shared/glass-card";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2, ExternalLink, Phone, Mail } from "lucide-react";
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
    <GlassCard className="p-0 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Products</TableHead>
            <TableHead>Notes</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((s) => (
            <TableRow key={s.id}>
              <TableCell>
                <div className="font-medium">{s.name}</div>
                {s.website && (
                  <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-0.5">
                    <ExternalLink className="w-3 h-3" />Website
                  </a>
                )}
              </TableCell>
              <TableCell>
                <div className="space-y-0.5 text-sm">
                  {s.phone && <div className="flex items-center gap-1"><Phone className="w-3 h-3" />{s.phone}</div>}
                  {s.email && <div className="flex items-center gap-1"><Mail className="w-3 h-3" />{s.email}</div>}
                </div>
              </TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{s.products || "-"}</TableCell>
              <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">{s.notes || "-"}</TableCell>
              <TableCell>
                <div className="flex gap-1 justify-end">
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </GlassCard>
  );
}
