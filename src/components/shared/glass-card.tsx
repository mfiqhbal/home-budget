import { cn } from "@/lib/utils";

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  hover?: boolean;
  variant?: "default" | "dark" | "accent";
}

export function GlassCard({ children, hover = false, variant = "default", className, ...props }: GlassCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl p-6",
        variant === "default" && "glass",
        variant === "dark" && "glass-dark text-white",
        variant === "accent" && "glass card-accent-left",
        hover && "glass-hover transition-all duration-200 cursor-pointer",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
