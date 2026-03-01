import { getComparison, getComparisonItems } from "../actions";
import { PageHeader } from "@/components/shared/page-header";
import { ComparisonItemsTable } from "./comparison-items-table";
import { ComparisonItemDialog } from "./comparison-item-dialog";
import { ComparisonDialog } from "../comparison-dialog";
import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";
import { getSuppliers } from "../../suppliers/actions";

export default async function ComparisonDetailPage({
  params,
}: {
  params: Promise<{ projectId: string; id: string }>;
}) {
  const { projectId, id } = await params;
  const [comparison, items, suppliers] = await Promise.all([
    getComparison(id),
    getComparisonItems(id),
    getSuppliers(projectId),
  ]);

  const hasBudgetLink = !!comparison.budget_items;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <Link href={`/projects/${projectId}/comparisons`} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" />
          Back to comparisons
        </Link>
        {/* Show linked budget item with link back */}
        {comparison.budget_items && (
          <Link
            href={`/projects/${projectId}/budget`}
            className="inline-flex items-center gap-1.5 text-xs text-primary bg-primary/5 hover:bg-primary/10 rounded-full px-3 py-1.5 transition-colors"
          >
            <DollarSign className="w-3 h-3" />
            Budget: {comparison.budget_items.category} &rarr; {comparison.budget_items.item_name}
          </Link>
        )}
      </div>

      <PageHeader
        title={comparison.name}
        description={
          hasBudgetLink
            ? "Select a product to auto-update the budget actual amount"
            : comparison.notes || undefined
        }
      >
        <div className="flex gap-2">
          <ComparisonDialog
            projectId={projectId}
            mode="edit"
            comparison={{
              id: comparison.id,
              name: comparison.name,
              category: comparison.category || "",
              itemType: comparison.item_type || "",
              notes: comparison.notes || "",
            }}
          />
          <ComparisonItemDialog projectId={projectId} comparisonId={id} suppliers={suppliers} mode="create" />
        </div>
      </PageHeader>

      <ComparisonItemsTable
        items={items}
        projectId={projectId}
        comparisonId={id}
        suppliers={suppliers}
      />
    </div>
  );
}
