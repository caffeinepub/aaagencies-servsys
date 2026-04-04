import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MOCK_TASKS } from "@/lib/mockData";
import { ClipboardList } from "lucide-react";
import { useState } from "react";

// MOCK DATA - Phase 4 will replace with real request API
const STATUS_CONFIG: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  completed: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

export default function MyRequests() {
  const [filter, setFilter] = useState("all");
  const tasks = MOCK_TASKS.filter(
    (t) => filter === "all" || t.status === filter,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">My Requests</h1>
        <p className="text-muted-foreground text-sm mt-1">
          All your submitted service requests
        </p>
      </div>

      <div className="flex gap-1.5 flex-wrap">
        {["all", "pending", "in_progress", "completed"].map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setFilter(f)}
          >
            {f === "all"
              ? "All"
              : f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {tasks.length === 0 ? (
        <div className="py-12 text-center">
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">No requests found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center gap-3 p-4 rounded-lg border border-border/60"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground">
                  {task.description.slice(0, 80)}...
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {task.createdAt}
                </p>
              </div>
              <Badge
                variant="outline"
                className={`text-xs shrink-0 ${STATUS_CONFIG[task.status] ?? "bg-muted text-muted-foreground"}`}
              >
                {task.status.replace("_", " ")}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
