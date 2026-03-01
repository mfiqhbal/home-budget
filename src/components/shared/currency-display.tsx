"use client";

import { formatCurrency } from "@/lib/format";
import { cn } from "@/lib/utils";

interface CurrencyDisplayProps {
  amount: number | string;
  currency?: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function CurrencyDisplay({
  amount,
  currency = "MYR",
  className,
  size = "md",
}: CurrencyDisplayProps) {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  const isNegative = num < 0;

  return (
    <span
      className={cn(
        "font-mono tabular-nums",
        size === "sm" && "text-sm",
        size === "md" && "text-base",
        size === "lg" && "text-xl font-semibold",
        isNegative && "text-destructive",
        className
      )}
    >
      {formatCurrency(amount, currency)}
    </span>
  );
}
