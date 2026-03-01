import { getWiringPlans } from "./actions";
import { getProject } from "../../actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { WiringTable } from "./wiring-table";
import { WiringDialog } from "./wiring-dialog";
import { Zap } from "lucide-react";
import { CurrencyDisplay } from "@/components/shared/currency-display";

export default async function WiringPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, plans] = await Promise.all([
    getProject(projectId),
    getWiringPlans(projectId),
  ]);

  const totalCost = plans.reduce((sum, p) => {
    const unit = parseFloat(p.price_per_unit || "0");
    const install = parseFloat(p.installation_price || "0");
    const qty = p.quantity || 1;
    return sum + (unit * qty) + install;
  }, 0);

  // Group by location
  const grouped = plans.reduce((acc, plan) => {
    const loc = plan.location || "Unspecified";
    if (!acc[loc]) acc[loc] = [];
    acc[loc].push(plan);
    return acc;
  }, {} as Record<string, typeof plans>);

  return (
    <div>
      <PageHeader title="Wiring & Electrical" description={`${plans.length} items planned`}>
        <WiringDialog projectId={projectId} mode="create" />
      </PageHeader>

      {plans.length > 0 && (
        <GlassCard className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <Zap className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Wiring Cost</p>
              <CurrencyDisplay amount={totalCost} currency={project.currency} size="lg" />
            </div>
          </div>
        </GlassCard>
      )}

      {plans.length === 0 ? (
        <GlassCard className="text-center py-12">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No wiring plans yet</p>
          <WiringDialog projectId={projectId} mode="create" />
        </GlassCard>
      ) : (
        <WiringTable grouped={grouped} projectId={projectId} currency={project.currency} />
      )}
    </div>
  );
}
