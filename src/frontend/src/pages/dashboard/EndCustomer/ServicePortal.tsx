import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { Bot, Headphones, History, Plus, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { AgentDefinition, Task } from "../../../backend.d";
import { AgentStatus } from "../../../backend.d";
import { AgentChatDrawer } from "../../../components/AgentChatDrawer";

const TASK_STATUS_CONFIG: Record<string, string> = {
  completed: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground border-border",
};

function formatTaskDate(ts: bigint): string {
  const ms = Number(ts / 1_000_000n);
  return new Date(ms).toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ServicePortal() {
  const { actor } = useActor(createActor);
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [firstActiveAgent, setFirstActiveAgent] =
    useState<AgentDefinition | null>(null);
  const [loadingAgents, setLoadingAgents] = useState(true);
  const [chatTarget, setChatTarget] = useState<AgentDefinition | null>(null);

  const loadData = useCallback(async () => {
    if (!actor) return;

    const [tasksResult, agentsResult] = await Promise.all([
      actor.getMyTasks().catch(() => null),
      actor.getMyOrganization().then((org) => {
        if (!org) return null;
        return actor.getAgentsByOrg(org.id).catch(() => null);
      }),
    ]);

    if (tasksResult && tasksResult.__kind__ === "ok") {
      const sorted = [...tasksResult.ok].sort((a, b) =>
        Number(b.createdAt - a.createdAt),
      );
      setRecentTasks(sorted.slice(0, 3));
    }
    setLoadingTasks(false);

    if (agentsResult && agentsResult.__kind__ === "ok") {
      const active = agentsResult.ok.find(
        (a) => a.status === AgentStatus.active,
      );
      setFirstActiveAgent(active ?? null);
    }
    setLoadingAgents(false);
  }, [actor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleTalkToAgent = () => {
    if (firstActiveAgent) {
      setChatTarget(firstActiveAgent);
    } else {
      toast.info("No active agents available");
    }
  };

  return (
    <div className="space-y-6">
      {/* Chat drawer */}
      <AgentChatDrawer
        agent={chatTarget}
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
      />

      {/* Hero */}
      <div className="rounded-xl border border-border/60 bg-gradient-to-br from-primary/8 to-transparent p-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/15 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
        </div>
        <h1 className="text-2xl font-display font-semibold mb-2">
          How can we help you today?
        </h1>
        <p className="text-muted-foreground text-sm max-w-md mx-auto">
          Our AI agents are ready to assist. Start a new request or chat with an
          agent now.
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card
          className="border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() =>
            toast.info("Use the My Requests page to submit a new request")
          }
          data-ocid="portal.primary_button"
        >
          <CardContent className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 mb-3">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-sm">
              Start a Request
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Submit a new service request
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={() => toast.info("View all requests in My Requests")}
          data-ocid="portal.secondary_button"
        >
          <CardContent className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-teal-500/10 mb-3">
              <History className="w-5 h-5 text-teal-400" />
            </div>
            <h3 className="font-display font-semibold text-sm">
              View My History
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Review past requests
            </p>
          </CardContent>
        </Card>

        <Card
          className="border-border/60 cursor-pointer hover:border-primary/40 transition-colors"
          onClick={handleTalkToAgent}
          data-ocid="portal.open_modal_button"
        >
          <CardContent className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 mb-3">
              {loadingAgents ? (
                <Bot className="w-5 h-5 text-purple-400 animate-pulse" />
              ) : (
                <Bot className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <h3 className="font-display font-semibold text-sm">
              Talk to an Agent
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              {loadingAgents
                ? "Loading agents..."
                : firstActiveAgent
                  ? `Chat with ${firstActiveAgent.name}`
                  : "No agents available"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent requests */}
      <div>
        <h2 className="font-display font-semibold text-base mb-3">
          Recent Requests
        </h2>
        {loadingTasks ? (
          <div className="space-y-2" data-ocid="portal.loading_state">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/60"
              >
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <Skeleton className="h-5 w-20 rounded-full" />
              </div>
            ))}
          </div>
        ) : recentTasks.length === 0 ? (
          <div
            className="text-center py-8 rounded-lg border border-border/60"
            data-ocid="portal.empty_state"
          >
            <Headphones className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">No requests yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Submit your first service request to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((task, idx) => (
              <div
                key={task.id}
                className="flex items-center gap-3 p-4 rounded-lg border border-border/60"
                data-ocid={`portal.item.${idx + 1}`}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTaskDate(task.createdAt)}
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs shrink-0 ${
                    TASK_STATUS_CONFIG[task.status] ??
                    TASK_STATUS_CONFIG.pending
                  }`}
                >
                  {task.status.replace("_", " ")}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
