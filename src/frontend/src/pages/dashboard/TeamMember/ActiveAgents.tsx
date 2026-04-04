import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_AGENTS } from "@/lib/mockData";
import { Bot, Cpu } from "lucide-react";

// MOCK DATA - Phase 4 will replace with real Agent API
const STATUS_CONFIG = {
  active: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  training: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export default function ActiveAgents() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">Active Agents</h1>
        <p className="text-muted-foreground text-sm mt-1">
          AI agents available in your organization's swarm
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_AGENTS.map((agent) => (
          <Card key={agent.id} className="border-border/60">
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
                      className={`text-xs ${STATUS_CONFIG[agent.status]} shrink-0`}
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
                  <div className="flex flex-wrap gap-1">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
