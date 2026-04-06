import type { AgentDefinition, Organization, Task } from "@/backend.d";
import { AgentStatus, TaskStatus } from "@/backend.d";
import { PlanTierBadge } from "@/components/PlanTierBadge";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import { Bot, Building2, ClipboardList, Users } from "lucide-react";

type DisplayOrg = { name: string; description: string; planTier: string };

function toDisplayOrg(org: Organization | null | undefined): DisplayOrg {
  if (!org) {
    return { name: "", description: "", planTier: "free" };
  }
  const planTier =
    typeof org.planTier === "object"
      ? (Object.keys(org.planTier)[0] ?? "free")
      : String(org.planTier);
  return { name: org.name, description: org.description, planTier };
}

export default function OrgDashboard() {
  const { actor, isFetching } = useActor();

  const { data: org, isLoading } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor && !isFetching,
  });

  const { data: teamMembers } = useQuery({
    queryKey: ["team-members", org?.id],
    queryFn: async () => {
      if (!actor || !org?.id) return [];
      return actor.getTeamMembersByOrg(org.id);
    },
    enabled: !!actor && !!org?.id && !isFetching,
  });

  const { data: branches } = useQuery({
    queryKey: ["branches", org?.id],
    queryFn: async () => {
      if (!actor || !org?.id) return [];
      return actor.getBranchesByOrg(org.id);
    },
    enabled: !!actor && !!org?.id && !isFetching,
  });

  const { data: agentsResult, isLoading: agentsLoading } = useQuery({
    queryKey: ["agents", org?.id],
    queryFn: async () => {
      if (!actor || !org?.id) return null;
      return actor.getAgentsByOrg(org.id);
    },
    enabled: !!actor && !!org?.id && !isFetching,
  });

  const { data: tasksResult, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", org?.id],
    queryFn: async () => {
      if (!actor || !org?.id) return null;
      return actor.getTasksByOrg(org.id);
    },
    enabled: !!actor && !!org?.id && !isFetching,
  });

  const displayOrg = toDisplayOrg(org);
  const teamCount = Array.isArray(teamMembers) ? teamMembers.length : 0;
  const branchCount = Array.isArray(branches) ? branches.length : 0;

  const agents: AgentDefinition[] =
    agentsResult?.__kind__ === "ok" ? agentsResult.ok : [];
  const tasks: Task[] = tasksResult?.__kind__ === "ok" ? tasksResult.ok : [];

  const agentCount = agents.filter(
    (a) => a.status === AgentStatus.active || (a.status as string) === "active",
  ).length;

  const taskCount = tasks.filter(
    (t) =>
      t.status !== TaskStatus.completed &&
      t.status !== TaskStatus.cancelled &&
      (t.status as string) !== "completed" &&
      (t.status as string) !== "cancelled",
  ).length;

  const recentTasks = tasks.slice(0, 5);

  return (
    <div className="space-y-6">
      {isLoading ? (
        <Skeleton className="h-24 w-full" />
      ) : org ? (
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
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Team Members"
          value={teamCount}
          icon={Users}
          iconClassName="bg-teal-500/10"
        />
        <StatCard
          title="Branches"
          value={branchCount}
          icon={Building2}
          iconClassName="bg-blue-500/10"
        />
        <StatCard
          title="Active Agents"
          value={agentsLoading ? "—" : agentCount}
          icon={Bot}
          iconClassName="bg-purple-500/10"
        />
        <StatCard
          title="Open Tasks"
          value={tasksLoading ? "—" : taskCount}
          icon={ClipboardList}
          iconClassName="bg-amber-500/10"
        />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">Recent Tasks</CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {tasksLoading ? (
            <div className="divide-y divide-border/40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-14" />
                </div>
              ))}
            </div>
          ) : recentTasks.length === 0 ? (
            <div className="flex items-center justify-center py-8 text-sm text-muted-foreground">
              No tasks yet
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center gap-3 px-5 py-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{task.title}</p>
                    {task.assignedAgentId && (
                      <p className="text-xs text-muted-foreground">
                        Agent: {task.assignedAgentId}
                      </p>
                    )}
                  </div>
                  <TaskStatusBadge status={task.status as string} />
                  <PriorityBadge priority={task.priority as string} />
                </div>
              ))}
            </div>
          )}
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
