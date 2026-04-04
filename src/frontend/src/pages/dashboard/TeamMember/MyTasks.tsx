import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { MOCK_TASKS } from "@/lib/mockData";
import { ChevronDown, ChevronUp, ClipboardList } from "lucide-react";
import { useState } from "react";

// MOCK DATA - Phase 4 will replace with real Task API
const STATUS_FILTERS = ["all", "pending", "in_progress", "completed", "failed"];

const STATUS_CONFIG: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  in_progress: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  completed: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
  cancelled: "bg-muted text-muted-foreground",
};

const PRIORITY_CONFIG: Record<string, string> = {
  low: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  medium: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  high: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  urgent: "bg-red-500/10 text-red-400 border-red-500/30",
};

export default function MyTasks() {
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const tasks = MOCK_TASKS.filter(
    (t) => filter === "all" || t.status === filter,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">My Tasks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {MOCK_TASKS.length} tasks assigned to you
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap">
        {STATUS_FILTERS.map((f) => (
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
          <p className="text-muted-foreground text-sm">
            No tasks with this status
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="border border-border/60 rounded-lg overflow-hidden"
            >
              <button
                type="button"
                className="w-full flex items-center gap-3 p-4 hover:bg-muted/20 transition-colors text-left"
                onClick={() =>
                  setExpanded(expanded === task.id ? null : task.id)
                }
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  {task.assignedAgentName && (
                    <p className="text-xs text-muted-foreground">
                      Agent: {task.assignedAgentName} • {task.createdAt}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs ${PRIORITY_CONFIG[task.priority]}`}
                  >
                    {task.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${STATUS_CONFIG[task.status]}`}
                  >
                    {task.status.replace("_", " ")}
                  </Badge>
                  {expanded === task.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>
              {expanded === task.id && (
                <div className="px-4 pb-4 border-t border-border/40">
                  <p className="text-sm text-muted-foreground mt-3">
                    {task.description}
                  </p>
                  <div className="flex gap-1.5 mt-3 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    Language: {task.language.toUpperCase()} • Updated:{" "}
                    {task.updatedAt}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
