import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MOCK_AGENTS } from "@/lib/mockData";
import { Activity, Bot, Cpu, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// MOCK DATA - Phase 4 will replace with real Agent API
const STATUS_CONFIG = {
  active: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  training: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

export default function AiAgents() {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">AI Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Swarm agents registered to your organization
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                Register AI Agent
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Agent Name</Label>
                <Input placeholder="e.g. SupportBot Alpha" />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input placeholder="What does this agent do?" />
              </div>
              <div className="space-y-2">
                <Label>Model Type</Label>
                <Input placeholder="e.g. GPT-4, Claude 3.5" />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  toast.success(
                    "Agent registered (Phase 4 will wire full API)",
                  );
                  setOpen(false);
                }}
              >
                Register Agent
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_AGENTS.map((agent) => (
          <Card key={agent.id} className="border-border/60">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <Badge
                  variant="outline"
                  className={`text-xs ${STATUS_CONFIG[agent.status]}`}
                >
                  {agent.status}
                </Badge>
              </div>
              <h3 className="font-display font-semibold text-sm mb-1">
                {agent.name}
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                {agent.description}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3">
                <Cpu className="w-3 h-3" />
                {agent.modelType}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {agent.capabilities.map((cap) => (
                  <Badge key={cap} variant="secondary" className="text-xs">
                    {cap}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center gap-1 flex-wrap">
                {agent.supportedLanguages.map((lang) => (
                  <span
                    key={lang}
                    className="text-xs bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground"
                  >
                    {lang.toUpperCase()}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
