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
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-4)",
  "var(--chart-5)",
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
    <div className="grid gap-4 lg:grid-cols-2">
      <GlassCard>
        <h3 className="font-semibold mb-4">Estimate vs Actual by Category</h3>
        <ChartContainer config={barConfig} className="h-[300px] w-full">
          <BarChart data={categoryData}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => value.length > 10 ? value.slice(0, 10) + "..." : value}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              fontSize={12}
              tickFormatter={(value) => `${currency} ${(value / 1000).toFixed(0)}k`}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="estimate" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="var(--chart-2)" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </GlassCard>

      <GlassCard>
        <h3 className="font-semibold mb-4">Budget Distribution</h3>
        <ChartContainer config={pieConfig} className="h-[300px] w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent />} />
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </GlassCard>
    </div>
  );
}
