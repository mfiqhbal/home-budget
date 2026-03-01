"use client";

import { GlassCard } from "@/components/shared/glass-card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, Pie, PieChart, Cell } from "recharts";

const barConfig: ChartConfig = {
  estimate: { label: "Estimate", color: "var(--chart-1)" },
  actual: { label: "Actual", color: "var(--chart-2)" },
};

const PIE_COLORS = [
  "#0D9488",
  "#CD8C3C",
  "#22C55E",
  "#D4A050",
  "#3B82F6",
];

interface BudgetChartsProps {
  categoryData: { name: string; estimate: number; actual: number }[];
  pieData: { name: string; value: number }[];
  currency: string;
}

export function BudgetCharts({ categoryData, pieData, currency }: BudgetChartsProps) {
  const pieConfig: ChartConfig = Object.fromEntries(
    pieData.map((d, i) => [d.name, { label: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }])
  );

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <GlassCard className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-heading font-semibold text-sm">Estimate vs Actual by Category</h3>
          <div className="flex gap-3">
            <div className="flex items-center gap-1 text-[10px] font-body text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-primary" />Estimate
            </div>
            <div className="flex items-center gap-1 text-[10px] font-body text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-copper" />Actual
            </div>
          </div>
        </div>
        <ChartContainer config={barConfig} className="h-[250px] w-full">
          <BarChart data={categoryData}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={10}
              tickFormatter={(value) => value.length > 8 ? value.slice(0, 8) + ".." : value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={10}
              width={50}
              tickFormatter={(value) => `${currency} ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="estimate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </GlassCard>

      <GlassCard className="p-4">
        <h3 className="font-heading font-semibold text-sm mb-3">Budget Distribution</h3>
        <ChartContainer config={pieConfig} className="h-[220px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={85}
              paddingAngle={2}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className="flex flex-wrap gap-x-3 gap-y-1 justify-center mt-2">
          {pieData.map((d, i) => (
            <div key={d.name} className="flex items-center gap-1 text-[10px] font-body text-muted-foreground">
              <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
              {d.name}
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
