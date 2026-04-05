import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import { ChevronDown, ChevronUp, ClipboardList, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AgentDefinition, Task, TaskInput } from "../../../backend.d";
import { TaskPriority, TaskStatus } from "../../../backend.d";

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  in_progress: {
    label: "In Progress",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  completed: {
    label: "Completed",
    className: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  },
  failed: {
    label: "Failed",
    className: "bg-destructive/10 text-destructive border-destructive/30",
  },
  cancelled: {
    label: "Cancelled",
    className: "bg-muted text-muted-foreground border-border",
  },
};

const PRIORITY_CONFIG: Record<string, { label: string; className: string }> = {
  low: {
    label: "Low",
    className: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  },
  medium: {
    label: "Medium",
    className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  },
  high: {
    label: "High",
    className: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  urgent: {
    label: "Urgent",
    className: "bg-red-500/10 text-red-400 border-red-500/30",
  },
};

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "zh", label: "普通话" },
  { value: "ar", label: "العربية" },
  { value: "pt", label: "Português" },
  { value: "sw", label: "Kiswahili" },
];

const STATUS_FILTERS = [
  "all",
  "pending",
  "in_progress",
  "completed",
  "failed",
  "cancelled",
];

const formatDate = (ts: bigint) =>
  new Date(Number(ts) / 1_000_000).toLocaleDateString();

const parseTags = (s: string) =>
  s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

interface TaskFormState {
  title: string;
  description: string;
  priority: TaskPriority;
  language: string;
  tagsRaw: string;
  agentId: string;
  inputData: string;
}

const DEFAULT_FORM: TaskFormState = {
  title: "",
  description: "",
  priority: TaskPriority.medium,
  language: "en",
  tagsRaw: "",
  agentId: "",
  inputData: "",
};

function TaskFormFields({
  form,
  onChange,
  agents,
  idPrefix,
}: {
  form: TaskFormState;
  onChange: (f: TaskFormState) => void;
  agents: AgentDefinition[];
  idPrefix: string;
}) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-title`}>
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${idPrefix}-title`}
          data-ocid="task.input"
          placeholder="e.g. Generate Q3 Sales Report"
          value={form.title}
          onChange={(e) => onChange({ ...form, title: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-desc`}>
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`${idPrefix}-desc`}
          data-ocid="task.textarea"
          placeholder="Describe what needs to be done..."
          rows={3}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={form.priority}
            onValueChange={(v) =>
              onChange({ ...form, priority: v as TaskPriority })
            }
          >
            <SelectTrigger data-ocid="task.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={TaskPriority.low}>Low</SelectItem>
              <SelectItem value={TaskPriority.medium}>Medium</SelectItem>
              <SelectItem value={TaskPriority.high}>High</SelectItem>
              <SelectItem value={TaskPriority.urgent}>Urgent</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={form.language}
            onValueChange={(v) => onChange({ ...form, language: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LANGUAGE_OPTIONS.map((l) => (
                <SelectItem key={l.value} value={l.value}>
                  {l.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
        <Input
          id={`${idPrefix}-tags`}
          placeholder="report, urgent, q3 (comma-separated)"
          value={form.tagsRaw}
          onChange={(e) => onChange({ ...form, tagsRaw: e.target.value })}
        />
      </div>

      {agents.length > 0 && (
        <div className="space-y-2">
          <Label>Assign to Agent (optional)</Label>
          <Select
            value={form.agentId || "__none__"}
            onValueChange={(v) =>
              onChange({ ...form, agentId: v === "__none__" ? "" : v })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="No agent assigned" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">No agent</SelectItem>
              {agents.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  {a.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-input`}>Input Data (optional)</Label>
        <Textarea
          id={`${idPrefix}-input`}
          placeholder="Additional context or data for this task..."
          rows={2}
          value={form.inputData}
          onChange={(e) => onChange({ ...form, inputData: e.target.value })}
          className="resize-none"
        />
      </div>
    </div>
  );
}

function RowSkeleton() {
  return (
    <div className="border border-border/60 rounded-lg p-4">
      <div className="flex items-center gap-3">
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-32" />
        </div>
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
    </div>
  );
}

export default function MyTasks() {
  const { actor } = useActor();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<TaskFormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{
    taskId: string;
    newStatus: TaskStatus;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!actor) return;
    try {
      const [tasksResult, orgResult] = await Promise.all([
        actor.getMyTasks(),
        actor.getMyOrganization(),
      ]);
      if (tasksResult.__kind__ === "ok") {
        setTasks(
          [...tasksResult.ok].sort(
            (a, b) => Number(b.createdAt) - Number(a.createdAt),
          ),
        );
      } else {
        toast.error(tasksResult.err);
      }
      if (orgResult) {
        const agentsResult = await actor.getAgentsByOrg(orgResult.id);
        if (agentsResult.__kind__ === "ok") {
          setAgents(agentsResult.ok);
        }
      }
    } catch (_e) {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreate = async () => {
    if (!actor) return;
    if (!form.title.trim() || !form.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const input: TaskInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        priority: form.priority,
        language: form.language,
        tags: parseTags(form.tagsRaw),
        assignedAgentId: form.agentId || undefined,
        inputData: form.inputData.trim() || undefined,
      };
      const result = await actor.createTask(input);
      if (result.__kind__ === "ok") {
        setTasks((prev) => [result.ok, ...prev]);
        setCreateOpen(false);
        setForm(DEFAULT_FORM);
        toast.success(`Task "${result.ok.title}" created`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to create task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleStatusUpdate = async (taskId: string, newStatus: TaskStatus) => {
    if (!actor) return;
    setStatusUpdating(taskId);
    try {
      const result = await actor.updateTaskStatus(taskId, newStatus);
      if (result.__kind__ === "ok") {
        setTasks((prev) => prev.map((t) => (t.id === taskId ? result.ok : t)));
        toast.success("Status updated");
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to update status");
    } finally {
      setStatusUpdating(null);
      setConfirmStatus(null);
    }
  };

  const agentName = (agentId?: string) =>
    agentId ? (agents.find((a) => a.id === agentId)?.name ?? agentId) : null;

  const filtered = tasks.filter((t) => filter === "all" || t.status === filter);

  return (
    <div className="space-y-6">
      {/* Confirm status change */}
      <AlertDialog
        open={!!confirmStatus}
        onOpenChange={(open) => !open && setConfirmStatus(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Update Task Status
            </AlertDialogTitle>
            <AlertDialogDescription>
              Change status to{" "}
              <strong className="text-foreground">
                {confirmStatus
                  ? STATUS_CONFIG[confirmStatus.newStatus]?.label
                  : ""}
              </strong>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="task.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="task.confirm_button"
              disabled={!!statusUpdating}
              onClick={() =>
                confirmStatus &&
                handleStatusUpdate(
                  confirmStatus.taskId,
                  confirmStatus.newStatus,
                )
              }
            >
              {statusUpdating ? "Updating..." : "Confirm"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">My Tasks</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} assigned to you
          </p>
        </div>
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setForm(DEFAULT_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="task.primary_button">
              <Plus className="w-4 h-4 mr-1.5" />
              New Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">Create Task</DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <TaskFormFields
                form={form}
                onChange={setForm}
                agents={agents}
                idPrefix="create-task"
              />
            </div>
            <Button
              className="w-full mt-2"
              data-ocid="task.submit_button"
              onClick={handleCreate}
              disabled={
                submitting || !form.title.trim() || !form.description.trim()
              }
            >
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap" data-ocid="task.filter.tab">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setFilter(f)}
            data-ocid={"task.tab"}
          >
            {f === "all"
              ? "All"
              : f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Task list */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <RowSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-16 text-center border border-border/60 rounded-lg"
          data-ocid="task.empty_state"
        >
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">
            {filter === "all"
              ? "No tasks yet"
              : `No ${filter.replace("_", " ")} tasks`}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "all"
              ? "Create a task above or wait for one to be assigned."
              : "Try a different status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, idx) => (
            <div
              key={task.id}
              className="border border-border/60 rounded-lg overflow-hidden"
              data-ocid={`task.item.${idx + 1}`}
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
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {agentName(task.assignedAgentId)
                      ? `Agent: ${agentName(task.assignedAgentId)} • `
                      : ""}
                    {formatDate(task.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      PRIORITY_CONFIG[task.priority]?.className ?? ""
                    }`}
                  >
                    {PRIORITY_CONFIG[task.priority]?.label ?? task.priority}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={`text-xs ${
                      STATUS_CONFIG[task.status]?.className ?? ""
                    }`}
                  >
                    {STATUS_CONFIG[task.status]?.label ?? task.status}
                  </Badge>
                  {expanded === task.id ? (
                    <ChevronUp className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>
              </button>

              {expanded === task.id && (
                <div className="px-4 pb-4 border-t border-border/40 space-y-3">
                  <p className="text-sm text-muted-foreground mt-3">
                    {task.description}
                  </p>

                  {task.tags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap">
                      {task.tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="text-xs"
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {task.inputData && (
                    <div className="rounded-md bg-muted/40 p-2.5">
                      <p className="text-xs text-muted-foreground font-medium mb-1">
                        Input Data
                      </p>
                      <p className="text-xs">{task.inputData}</p>
                    </div>
                  )}

                  {task.outputData && (
                    <div className="rounded-md bg-teal-500/5 border border-teal-500/20 p-2.5">
                      <p className="text-xs text-teal-400 font-medium mb-1">
                        Output
                      </p>
                      <p className="text-xs">{task.outputData}</p>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground">
                    Language: {task.language.toUpperCase()} • Updated:{" "}
                    {formatDate(task.updatedAt)}
                  </p>

                  <div className="pt-2 border-t border-border/40">
                    <Label className="text-xs text-muted-foreground mb-1.5 block">
                      Update Status
                    </Label>
                    <Select
                      value={task.status}
                      disabled={!!statusUpdating}
                      onValueChange={(v) =>
                        setConfirmStatus({
                          taskId: task.id,
                          newStatus: v as TaskStatus,
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-8 text-xs w-48"
                        data-ocid="task.select"
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskStatus).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            {STATUS_CONFIG[s]?.label ?? s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
