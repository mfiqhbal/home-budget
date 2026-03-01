import { getChecklistItems } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { ChecklistTable } from "./checklist-table";
import { ChecklistItemDialog } from "./checklist-item-dialog";
import { CheckSquare } from "lucide-react";

export default async function ChecklistPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const items = await getChecklistItems(projectId);

  const doneCount = items.filter((i) => i.status === "done").length;
  const progress = items.length > 0 ? Math.round((doneCount / items.length) * 100) : 0;

  return (
    <div>
      <PageHeader
        title="Checklist"
        description={`${doneCount}/${items.length} completed (${progress}%)`}
      >
        <ChecklistItemDialog projectId={projectId} mode="create" />
      </PageHeader>

      {items.length === 0 ? (
        <GlassCard className="text-center py-12">
          <CheckSquare className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground mb-4">No checklist items yet</p>
          <ChecklistItemDialog projectId={projectId} mode="create" />
        </GlassCard>
      ) : (
        <ChecklistTable items={items} projectId={projectId} />
      )}
    </div>
  );
}
