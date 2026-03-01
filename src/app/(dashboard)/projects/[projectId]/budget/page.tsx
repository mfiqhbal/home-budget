import { getBudgetItems, getLinkedComparisons } from "./actions";
import { getProject } from "../../actions";
import { PageHeader } from "@/components/shared/page-header";
import { BudgetTable } from "./budget-table";

export default async function BudgetPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const [project, items, linkedComparisons] = await Promise.all([
    getProject(projectId),
    getBudgetItems(projectId),
    getLinkedComparisons(projectId),
  ]);

  // Group by category
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "Uncategorized";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  const totalEstimate = items.reduce((sum, i) => sum + parseFloat(i.estimate_amount || "0"), 0);
  const totalActual = items.reduce((sum, i) => sum + parseFloat(i.actual_amount || "0"), 0);

  return (
    <div>
      <PageHeader
        title="Budget"
        description={items.length > 0
          ? `${items.length} items across ${Object.keys(grouped).length} categories — click any cell to edit`
          : "Click below to add your first budget item"
        }
      />

      <BudgetTable
        grouped={grouped}
        projectId={projectId}
        currency={project.currency}
        totalEstimate={totalEstimate}
        totalActual={totalActual}
        linkedComparisons={linkedComparisons}
      />
    </div>
  );
}
