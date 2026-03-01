import { createClient } from "@/lib/supabase/server";
import { getProject } from "../actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import { PriorityBadge } from "@/components/shared/priority-badge";
import { DollarSign, TrendingUp, TrendingDown, Layers } from "lucide-react";
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

  const utilizationPercent = summary.totalEstimate > 0
    ? Math.round((summary.totalActual / summary.totalEstimate) * 100)
    : 0;

  return (
    <div>
      <PageHeader
        title={project.name}
        description={project.description || "Project dashboard"}
      />

      {/* Hero section */}
      <GlassCard className="mb-4 relative overflow-hidden">
        <div className="flex items-center gap-8">
          {/* Circular progress ring */}
          <div className="relative w-24 h-24 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#E7E0D8" strokeWidth="7" />
              <circle
                cx="50" cy="50" r="42" fill="none"
                stroke="#CD8C3C"
                strokeWidth="7"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 42}`}
                strokeDashoffset={`${2 * Math.PI * 42 * (1 - Math.min(utilizationPercent, 100) / 100)}`}
                className="transition-all duration-1000"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-xl font-heading font-bold text-gradient">{utilizationPercent}%</span>
              <span className="text-[10px] text-muted-foreground font-body">used</span>
            </div>
          </div>

          <div>
            <p className="text-sm text-muted-foreground font-body mb-1">Total Budget</p>
            <CurrencyDisplay amount={summary.totalEstimate} currency={project.currency} size="lg" className="text-3xl text-gradient font-heading" />
            <p className="text-sm text-muted-foreground font-body mt-1">
              <CurrencyDisplay amount={summary.totalActual} currency={project.currency} size="sm" /> spent so far
            </p>
          </div>
        </div>
      </GlassCard>

      {/* Summary Cards — compact */}
      <div className="grid gap-3 grid-cols-2 lg:grid-cols-4 mb-4">
        {[
          { icon: DollarSign, label: "Total Estimate", amount: summary.totalEstimate, iconBg: "bg-primary/10", iconColor: "text-primary" },
          { icon: TrendingUp, label: "Total Actual", amount: summary.totalActual, iconBg: "bg-emerald-500/10", iconColor: "text-emerald-600" },
          { icon: TrendingDown, label: summary.difference >= 0 ? "Under Budget" : "Over Budget", amount: Math.abs(summary.difference), iconBg: summary.difference >= 0 ? "bg-emerald-500/10" : "bg-destructive/10", iconColor: summary.difference >= 0 ? "text-emerald-600" : "text-destructive" },
          { icon: Layers, label: "Budget Items", amount: null as number | null, count: summary.itemCount, iconBg: "bg-copper/10", iconColor: "text-copper" },
        ].map((card) => (
          <GlassCard key={card.label} className="py-3 px-4">
            <div className="flex items-center gap-2.5">
              <div className={`p-1.5 rounded-lg ${card.iconBg}`}>
                <card.icon className={`w-4 h-4 ${card.iconColor}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-body">{card.label}</p>
                {card.amount !== null ? (
                  <CurrencyDisplay amount={card.amount} currency={project.currency} size="sm" className="font-semibold" />
                ) : (
                  <p className="text-base font-heading font-semibold">{card.count}</p>
                )}
              </div>
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Priority Summary — compact */}
      <div className="grid gap-3 sm:grid-cols-3 mb-4">
        {summary.byPriority.map((p) => {
          const ratio = p.estimate > 0 ? Math.min((p.actual / p.estimate) * 100, 100) : 0;
          return (
            <GlassCard key={p.priority} variant="accent" className="py-3 px-4">
              <div className="flex items-center justify-between mb-1.5">
                <PriorityBadge priority={p.priority} />
                <span className="text-xs text-muted-foreground font-body">{p.count} items</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <div>
                  <span className="text-muted-foreground text-xs">Estimate </span>
                  <CurrencyDisplay amount={p.estimate} currency={project.currency} size="sm" className="text-xs" />
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">Actual </span>
                  <CurrencyDisplay amount={p.actual} currency={project.currency} size="sm" className="text-xs" />
                </div>
              </div>
              <div className="mt-2 h-1 rounded-full bg-muted overflow-hidden">
                <div
                  className={`h-full rounded-full ${ratio > 100 ? "bg-destructive" : ratio > 80 ? "bg-amber-500" : "bg-emerald-500"}`}
                  style={{ width: `${ratio}%` }}
                />
              </div>
            </GlassCard>
          );
        })}
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
