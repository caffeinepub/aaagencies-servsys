import { PlanTierBadge } from "@/components/PlanTierBadge";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import type { MockOrg } from "@/lib/mockData";
import { MOCK_AGENTS, MOCK_ORGS, MOCK_TASKS } from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";
import { Bot, Building2, ClipboardList, Users } from "lucide-react";
import type { Organization } from "../../../backend.d";

type DisplayOrg = { name: string; description: string; planTier: string };

function toDisplayOrg(org: Organization | null | undefined): DisplayOrg {
  if (!org) {
    const mock: MockOrg = MOCK_ORGS[0];
    return {
      name: mock.name,
      description: mock.description,
      planTier: mock.planTier,
    };
  }
  const planTier =
    typeof org.planTier === "object"
      ? (Object.keys(org.planTier)[0] ?? "free")
      : String(org.planTier);
  return { name: org.name, description: org.description, planTier };
}

// MOCK DATA - Phase 3 will replace with real API
export default function OrgDashboard() {
  const { actor } = useActor();

  const { data: org, isLoading } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor,
  });

  const displayOrg = toDisplayOrg(org);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : (
        <Card className="border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-display font-semibold">
                    {displayOrg.name}
                  </h1>
                  <PlanTierBadge tier={displayOrg.planTier} />
                </div>
                <p className="text-sm text-muted-foreground">
                  {displayOrg.description}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Members"
          value={18}
          icon={Users}
          iconClassName="bg-teal-500/10"
        />
        <StatCard
          title="Branches"
          value={3}
          icon={Building2}
          iconClassName="bg-blue-500/10"
        />
        <StatCard
          title="Active Agents"
          value={MOCK_AGENTS.filter((a) => a.status === "active").length}
          icon={Bot}
          iconClassName="bg-purple-500/10"
        />
        <StatCard
          title="Open Tasks"
          value={MOCK_TASKS.filter((t) => t.status !== "completed").length}
          icon={ClipboardList}
          iconClassName="bg-amber-500/10"
        />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <div className="divide-y divide-border/40">
            {MOCK_TASKS.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.assignedAgentName && (
                    <p className="text-xs text-muted-foreground">
                      Agent: {task.assignedAgentName}
                    </p>
                  )}
                </div>
                <TaskStatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function TaskStatusBadge({ status }: { status: string }) {
  const config: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    completed: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    failed: "bg-destructive/10 text-destructive border-destructive/30",
    cancelled: "bg-muted text-muted-foreground",
  };
  const labels: Record<string, string> = {
    pending: "Pending",
    in_progress: "In Progress",
    completed: "Completed",
    failed: "Failed",
    cancelled: "Cancelled",
  };
  return (
    <Badge
      variant="outline"
      className={`text-xs ${config[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {labels[status] ?? status}
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const config: Record<string, string> = {
    low: "bg-slate-500/10 text-slate-400 border-slate-500/30",
    medium: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    urgent: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  return (
    <Badge variant="outline" className={`text-xs ${config[priority] ?? ""}`}>
      {priority}
    </Badge>
  );
}
