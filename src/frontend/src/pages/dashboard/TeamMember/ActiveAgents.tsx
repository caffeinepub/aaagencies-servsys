import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { Bot, Cpu, MessageSquare } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AgentDefinition } from "../../../backend.d";
import { AgentStatus } from "../../../backend.d";
import { AgentChatDrawer } from "../../../components/AgentChatDrawer";

const STATUS_CONFIG: Record<string, string> = {
  active: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  training: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

function AgentCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start gap-3">
          <Skeleton className="w-10 h-10 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-3/4" />
            <Skeleton className="h-3 w-24" />
            <div className="flex gap-1.5 pt-1">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-5 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function ActiveAgents() {
  const { actor } = useActor();
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [chatTarget, setChatTarget] = useState<AgentDefinition | null>(null);

  const loadAgents = useCallback(async () => {
    if (!actor) return;
    try {
      const orgResult = await actor.getMyOrganization();
      if (!orgResult) {
        // Team member may not have an org yet — show empty state
        setLoading(false);
        return;
      }
      const result = await actor.getAgentsByOrg(orgResult.id);
      if (result.__kind__ === "ok") {
        setAgents(result.ok);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  return (
    <div className="space-y-6">
      {/* Chat drawer */}
      <AgentChatDrawer
        agent={chatTarget}
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
      />

      <div>
        <h1 className="text-2xl font-display font-semibold">Active Agents</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI agents available in your organization's swarm
        </p>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card className="border-border/60" data-ocid="agents.empty_state">
          <CardContent className="py-16 text-center">
            <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No agents available</p>
            <p className="text-xs text-muted-foreground mt-1">
              No agents available in your organization's swarm
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, idx) => (
            <Card
              key={agent.id}
              className="border-border/60"
              data-ocid={`agents.item.${idx + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start gap-3">
                  <div className="p-2.5 rounded-lg bg-primary/10 shrink-0">
                    <Bot className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-semibold text-sm">
                        {agent.name}
                      </h3>
                      <Badge
                        variant="outline"
                        className={`text-xs shrink-0 ${
                          STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.inactive
                        }`}
                      >
                        {agent.status}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-1 mb-2">
                      {agent.description}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-2">
                      <Cpu className="w-3 h-3" />
                      {agent.modelType}
                    </div>

                    {agent.endpointUrl && (
                      <div className="mb-2">
                        <span className="inline-flex items-center gap-1 text-xs bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded px-1.5 py-0.5">
                          Endpoint configured
                        </span>
                      </div>
                    )}

                    {agent.capabilities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {agent.capabilities.map((cap) => (
                          <Badge
                            key={cap}
                            variant="secondary"
                            className="text-xs"
                          >
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    )}

                    {agent.supportedLanguages.length > 0 && (
                      <div className="flex items-center gap-1 flex-wrap mb-3">
                        {agent.supportedLanguages.map((lang) => (
                          <span
                            key={lang}
                            className="text-xs bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground"
                          >
                            {lang.toUpperCase()}
                          </span>
                        ))}
                      </div>
                    )}

                    {agent.status === AgentStatus.active && (
                      <div className="pt-2 border-t border-border/40">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                          data-ocid={`agents.open_modal_button.${idx + 1}`}
                          onClick={() => setChatTarget(agent)}
                        >
                          <MessageSquare className="w-3.5 h-3.5 mr-1" />
                          Chat
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
