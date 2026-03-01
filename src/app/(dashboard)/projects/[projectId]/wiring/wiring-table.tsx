"use client";

import { GlassCard } from "@/components/shared/glass-card";
import { CurrencyDisplay } from "@/components/shared/currency-display";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { WiringDialog } from "./wiring-dialog";
import { deleteWiringPlan } from "./actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { formatCurrency } from "@/lib/format";

interface WiringTableProps {
  grouped: Record<string, Array<{
    id: string;
    location: string;
    machine: string | null;
    plug_location: string | null;
    plug_type: string | null;
    wiring_type: string | null;
    quantity: number | null;
    price_per_unit: string | null;
    installation_price: string | null;
    notes: string | null;
  }>>;
  projectId: string;
  currency: string;
}

const LOCATION_ICONS: Record<string, string> = {
  kitchen: "🍳",
  bathroom: "🚿",
  bedroom: "🛏️",
  "living room": "🛋️",
  garage: "🚗",
  laundry: "🧺",
  outdoor: "🌳",
  office: "💼",
};

function getLocationIcon(location: string) {
  const lower = location.toLowerCase();
  for (const [key, icon] of Object.entries(LOCATION_ICONS)) {
    if (lower.includes(key)) return icon;
  }
  return "⚡";
}

export function WiringTable({ grouped, projectId, currency }: WiringTableProps) {
  const router = useRouter();

  async function handleDelete(planId: string) {
    if (!confirm("Delete this wiring plan?")) return;
    try {
      await deleteWiringPlan(projectId, planId);
      toast.success("Plan deleted");
      router.refresh();
    } catch {
      toast.error("Failed to delete");
    }
  }

  const locations = Object.keys(grouped).sort();

  // Calculate max cost for relative bar widths
  const locationTotals = locations.map(loc => {
    return grouped[loc].reduce((sum, p) => {
      const unit = parseFloat(p.price_per_unit || "0");
      const install = parseFloat(p.installation_price || "0");
      const qty = p.quantity || 1;
      return sum + (unit * qty) + install;
    }, 0);
  });
  const maxTotal = Math.max(...locationTotals, 1);

  return (
    <div className="space-y-6">
      {locations.map((location, locIdx) => {
        const plans = grouped[location];
        const locationTotal = locationTotals[locIdx];
        const barWidth = (locationTotal / maxTotal) * 100;

        return (
          <GlassCard key={location} className="p-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-border/20 bg-gradient-to-r from-copper/[0.03] to-transparent">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-heading font-semibold flex items-center gap-2">
                  <span>{getLocationIcon(location)}</span>
                  {location}
                </h3>
                <CurrencyDisplay amount={locationTotal} currency={currency} size="sm" />
              </div>
              {/* Cost bar */}
              <div className="h-1 rounded-full bg-muted/40 overflow-hidden">
                <div
                  className="h-full rounded-full bg-copper/60 transition-all duration-500"
                  style={{ width: `${barWidth}%` }}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-body">Machine/Appliance</TableHead>
                  <TableHead className="font-body">Plug Location</TableHead>
                  <TableHead className="font-body">Type</TableHead>
                  <TableHead className="font-body">Qty</TableHead>
                  <TableHead className="text-right font-body">Unit Price</TableHead>
                  <TableHead className="text-right font-body">Install</TableHead>
                  <TableHead className="text-right font-body">Subtotal</TableHead>
                  <TableHead className="w-[80px]" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  const unit = parseFloat(plan.price_per_unit || "0");
                  const install = parseFloat(plan.installation_price || "0");
                  const qty = plan.quantity || 1;
                  const subtotal = unit * qty + install;
                  return (
                    <TableRow key={plan.id} className="hover:bg-copper/[0.02]">
                      <TableCell>
                        <div>
                          <span className="font-medium font-body">{plan.machine || "-"}</span>
                          {plan.notes && <p className="text-xs text-muted-foreground font-body">{plan.notes}</p>}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-body">{plan.plug_location || "-"}</TableCell>
                      <TableCell className="text-sm font-body">
                        {[plan.plug_type, plan.wiring_type].filter(Boolean).join(", ") || "-"}
                      </TableCell>
                      <TableCell className="font-body">{qty}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(unit, currency)}</TableCell>
                      <TableCell className="text-right font-mono text-sm">{formatCurrency(install, currency)}</TableCell>
                      <TableCell className="text-right font-mono text-sm font-medium">{formatCurrency(subtotal, currency)}</TableCell>
                      <TableCell>
                        <div className="flex gap-1 justify-end">
                          <WiringDialog
                            projectId={projectId}
                            mode="edit"
                            plan={{
                              id: plan.id,
                              location: plan.location,
                              machine: plan.machine || "",
                              plugLocation: plan.plug_location || "",
                              plugType: plan.plug_type || "",
                              wiringType: plan.wiring_type || "",
                              quantity: qty,
                              pricePerUnit: plan.price_per_unit || "0",
                              installationPrice: plan.installation_price || "0",
                              notes: plan.notes || "",
                            }}
                          />
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDelete(plan.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Subtotal row */}
                <TableRow className="bg-copper/[0.03] font-medium">
                  <TableCell colSpan={6} className="text-right text-sm text-muted-foreground font-body">
                    Subtotal
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm font-semibold">
                    {formatCurrency(locationTotal, currency)}
                  </TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          </GlassCard>
        );
      })}
    </div>
  );
}
