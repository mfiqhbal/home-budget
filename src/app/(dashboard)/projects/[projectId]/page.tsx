import { createClient } from "@/lib/supabase/server";
import { getProject } from "../actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle } from "lucide-react";
import { BudgetCharts } from "./budget-charts";

async function getBudgetSummary(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budget_items")
    .select("*")
    .eq("project_id", projectId);

  const items = data ?? [];
  const totalEstimate = items.reduce((sum, i) => sum + parseFloat(i.estimate_amount || "0"), 0);
  const totalActual = items.reduce((sum, i) => sum + parseFloat(i.actual_amount || "0"), 0);
  const difference = totalEstimate - totalActual;

  const byCategory: Record<string, { estimate: number; actual: number }> = {};
  for (const item of items) {
    const cat = item.category || "Uncategorized";
    if (!byCategory[cat]) byCategory[cat] = { estimate: 0, actual: 0 };
    byCategory[cat].estimate += parseFloat(item.estimate_amount || "0");
    byCategory[cat].actual += parseFloat(item.actual_amount || "0");
  }

  const byPriority = [1, 2, 3].map((p) => ({
    priority: p,
    estimate: items
      .filter((i) => i.priority === p)
      .reduce((sum, i) => sum + parseFloat(i.estimate_amount || "0"), 0),
    actual: items
      .filter((i) => i.priority === p)
      .reduce((sum, i) => sum + parseFloat(i.actual_amount || "0"), 0),
    count: items.filter((i) => i.priority === p).length,
  }));

  return { totalEstimate, totalActual, difference, byCategory, byPriority, itemCount: items.length };
}

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const project = await getProject(projectId);
  const summary = await getBudgetSummary(projectId);

  const categoryData = Object.entries(summary.byCategory).map(([name, values]) => ({
    name,
    estimate: values.estimate,
    actual: values.actual,
  }));

  const pieData = Object.entries(summary.byCategory).map(([name, values]) => ({
    name,
    value: values.estimate,
  }));

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description || "Project dashboard"}
      />

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Estimate</p>
              <CurrencyDisplay amount={summary.totalEstimate} currency={project.currency} size="lg" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Actual</p>
              <CurrencyDisplay amount={summary.totalActual} currency={project.currency} size="lg" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${summary.difference >= 0 ? "bg-emerald-500/10" : "bg-destructive/10"}`}>
              <TrendingDown className={`w-5 h-5 ${summary.difference >= 0 ? "text-emerald-600" : "text-destructive"}`} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">
                {summary.difference >= 0 ? "Under Budget" : "Over Budget"}
              </p>
              <CurrencyDisplay amount={Math.abs(summary.difference)} currency={project.currency} size="lg" />
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-amber-500/10">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Budget Items</p>
              <p className="text-xl font-semibold">{summary.itemCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Priority Summary */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {summary.byPriority.map((p) => (
          <GlassCard key={p.priority}>
            <div className="flex items-center justify-between mb-2">
              <PriorityBadge priority={p.priority} />
              <span className="text-sm text-muted-foreground">{p.count} items</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Estimate</span>
                <CurrencyDisplay amount={p.estimate} currency={project.currency} size="sm" />
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Actual</span>
                <CurrencyDisplay amount={p.actual} currency={project.currency} size="sm" />
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Charts */}
      {summary.itemCount > 0 && (
        <BudgetCharts
          categoryData={categoryData}
          pieData={pieData}
          currency={project.currency}
        />
      )}
    </div>
  );
}
