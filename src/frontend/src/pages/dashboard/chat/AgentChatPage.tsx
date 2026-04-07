import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { Bot } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { AgentDefinition } from "../../../backend.d";
import { AgentStatus } from "../../../backend.d";
import { AgentChatInterface } from "../../../components/AgentChatInterface";

export default function AgentChatPage() {
  const { actor } = useActor(createActor);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadAgents = useCallback(async () => {
    if (!actor) return;
    try {
      const orgResult = await actor.getMyOrganization();
      if (!orgResult) {
        setLoading(false);
        return;
      }
      const result = await actor.getAgentsByOrg(orgResult.id);
      if (result.__kind__ === "ok") {
        const active = result.ok.filter((a) => a.status === AgentStatus.active);
        setAgents(active);
        if (active.length > 0) {
          setSelectedId(active[0].id);
        }
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

  const selectedAgent = agents.find((a) => a.id === selectedId) ?? null;

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]" data-ocid="chat.page">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <h1 className="text-2xl font-display font-semibold">Agent Chat</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Direct conversation with an AI agent
        </p>
      </div>

      {loading ? (
        <div className="space-y-3" data-ocid="chat.loading_state">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-[calc(100vh-16rem)] w-full rounded-xl" />
        </div>
      ) : agents.length === 0 ? (
        <Card className="border-border/60" data-ocid="chat.empty_state">
          <CardContent className="py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <p className="font-display font-semibold">
              No active agents available
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Ask your organization admin to activate an agent before starting a
              chat.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Agent selector */}
          {agents.length > 1 && (
            <div className="mb-4 shrink-0">
              <Select
                value={selectedId ?? ""}
                onValueChange={(v) => setSelectedId(v)}
              >
                <SelectTrigger
                  className="w-full sm:w-72"
                  data-ocid="chat.select"
                >
                  <SelectValue placeholder="Select an agent" />
                </SelectTrigger>
                <SelectContent>
                  {agents.map((a) => (
                    <SelectItem key={a.id} value={a.id}>
                      {a.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Chat interface */}
          {selectedAgent && (
            <div className="flex-1 overflow-hidden rounded-xl border border-border/60 bg-card">
              <AgentChatInterface
                key={selectedAgent.id}
                agent={selectedAgent}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}
