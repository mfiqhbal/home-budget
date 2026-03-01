import { getComparisons } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { ComparisonDialog } from "./comparison-dialog";
import Link from "next/link";
import { GitCompareArrows, DollarSign } from "lucide-react";
import { DeleteComparisonButton } from "./delete-comparison-button";
import { formatDate } from "@/lib/format";

export default async function ComparisonsPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const comparisons = await getComparisons(projectId);

  return (
    <div>
      <PageHeader title="Product Comparisons" description="Compare products and prices side by side">
        <ComparisonDialog projectId={projectId} />
      </PageHeader>

      {comparisons.length === 0 ? (
        <GlassCard className="text-center py-12">
          <GitCompareArrows className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4 font-body">No comparisons yet</p>
          <p className="text-sm text-muted-foreground mb-4 font-body">
            Tip: You can create comparisons directly from the Budget page by clicking the compare icon on any item.
          </p>
          <ComparisonDialog projectId={projectId} />
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {comparisons.map((comp) => (
            <div key={comp.id} className="relative">
              <Link href={`/projects/${projectId}/comparisons/${comp.id}`}>
                <GlassCard hover className="h-full">
                  <h3 className="font-heading font-semibold text-lg mb-1">{comp.name}</h3>
                  {comp.category && (
                    <span className="text-xs bg-copper/10 text-copper rounded-full px-2.5 py-0.5 font-body">
                      {comp.category}
                    </span>
                  )}
                  {/* Show linked budget item */}
                  {comp.budget_items && (
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-copper/80 bg-copper/5 rounded-md px-2 py-1.5 font-body">
                      <DollarSign className="w-3 h-3 shrink-0" />
                      <span className="truncate">
                        Budget: {comp.budget_items.category} &rarr; {comp.budget_items.item_name}
                      </span>
                    </div>
                  )}
                  {comp.notes && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 font-body">{comp.notes}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-3 font-body">{formatDate(comp.created_at)}</p>
                </GlassCard>
              </Link>
              <div className="absolute top-4 right-4">
                <DeleteComparisonButton projectId={projectId} comparisonId={comp.id} name={comp.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
