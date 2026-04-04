import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type PlanTier = "free" | "starter" | "professional" | "enterprise" | string;

const PLAN_CONFIG: Record<string, { label: string; className: string }> = {
  free: {
    label: "Free",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
  starter: {
    label: "Starter",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  professional: {
    label: "Professional",
    className: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
  enterprise: {
    label: "Enterprise",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
};

export function PlanTierBadge({
  tier,
  className,
}: { tier: PlanTier; className?: string }) {
  const config = PLAN_CONFIG[tier] ?? {
    label: tier,
    className: "bg-muted text-muted-foreground",
  };
  return (
    <Badge
      variant="outline"
      className={cn("font-medium text-xs", config.className, className)}
    >
      {config.label}
    </Badge>
  );
}
