import { cn } from "@/lib/utils/tw";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  accent?: "primary" | "secondary" | "accent";
}

const accentMap: Record<NonNullable<MetricCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  accent: "bg-accent/10 text-accent"
};

const MetricCard = ({ title, value, change, icon: Icon, accent = "primary" }: MetricCardProps) => {
  return (
    <div className="rounded-3xl border border-border bg-surface p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-text/60">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-text">{value}</p>
        </div>
        <span className={cn("inline-flex h-10 w-10 items-center justify-center rounded-full", accentMap[accent])}>
          <Icon className="h-5 w-5" />
        </span>
      </div>
      {change ? <p className="mt-4 text-xs text-text/60">{change}</p> : null}
    </div>
  );
};

export default MetricCard;
