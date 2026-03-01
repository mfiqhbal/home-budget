export function formatCurrency(amount: number | string, currency = "MYR"): string {
  const num = typeof amount === "string" ? parseFloat(amount) : amount;
  if (isNaN(num)) return `${currency} 0.00`;
  return `${currency} ${num.toLocaleString("en-MY", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "-";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-MY", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function priorityLabel(priority: number): string {
  switch (priority) {
    case 1: return "P1 - High";
    case 2: return "P2 - Medium";
    case 3: return "P3 - Low";
    default: return `P${priority}`;
  }
}

export function statusLabel(status: string): string {
  switch (status) {
    case "not_started": return "Not Started";
    case "in_progress": return "In Progress";
    case "done": return "Done";
    default: return status;
  }
}
