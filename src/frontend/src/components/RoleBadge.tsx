import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Role =
  | "super_admin"
  | "org_admin"
  | "team_member"
  | "end_customer"
  | string;

const ROLE_CONFIG: Record<string, { label: string; className: string }> = {
  super_admin: {
    label: "Super Admin",
    className: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  org_admin: {
    label: "Org Admin",
    className: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  team_member: {
    label: "Team Member",
    className: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  },
  end_customer: {
    label: "Customer",
    className: "bg-slate-500/15 text-slate-400 border-slate-500/30",
  },
};

export function RoleBadge({
  role,
  className,
}: { role: Role; className?: string }) {
  const config = ROLE_CONFIG[role] ?? {
    label: role,
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
