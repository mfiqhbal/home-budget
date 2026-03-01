import { getSuppliers } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { SupplierDialog } from "./supplier-dialog";
import { SupplierTable } from "./supplier-table";
import { Users } from "lucide-react";

export default async function SuppliersPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const suppliers = await getSuppliers(projectId);

  return (
    <div>
      <PageHeader title="Suppliers" description="Manage your supplier contacts">
        <SupplierDialog projectId={projectId} mode="create" />
      </PageHeader>

      {suppliers.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No suppliers yet</p>
          <SupplierDialog projectId={projectId} mode="create" />
        </GlassCard>
      ) : (
        <SupplierTable suppliers={suppliers} projectId={projectId} />
      )}
    </div>
  );
}
