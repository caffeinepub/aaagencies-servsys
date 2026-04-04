import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_TASKS } from "@/lib/mockData";
import { Bot, Headphones, History, Plus, Sparkles } from "lucide-react";
import { toast } from "sonner";

// MOCK DATA - Phase 4 will replace with real service portal API
export default function ServicePortal() {
  const myRequests = MOCK_TASKS.filter((t) => t.orgId === "org-001").slice(
    0,
    3,
  );

  return (
    <div className="space-y-6">
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
          onClick={() => toast.info("Request creation coming in Phase 4")}
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
          onClick={() => toast.info("History view coming in Phase 4")}
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
          onClick={() => toast.info("Agent chat coming in Phase 4")}
        >
          <CardContent className="p-5 text-center">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-purple-500/10 mb-3">
              <Bot className="w-5 h-5 text-purple-400" />
            </div>
            <h3 className="font-display font-semibold text-sm">
              Talk to an Agent
            </h3>
            <p className="text-xs text-muted-foreground mt-1">
              Start an AI-assisted chat
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent requests */}
      <div>
        <h2 className="font-display font-semibold text-base mb-3">
          Recent Requests
        </h2>
        <div className="space-y-2">
          {myRequests.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 rounded-lg border border-border/60"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.createdAt}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs ${
                  task.status === "completed"
                    ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                    : task.status === "in_progress"
                      ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                      : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                {task.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
