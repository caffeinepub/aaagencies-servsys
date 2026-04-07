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
import { exportToCSV } from "@/lib/utils";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  Bot,
  Check,
  ClipboardList,
  Download,
  ListTodo,
  Pencil,
  Plus,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type {
  AgentDefinition,
  Task,
  TaskInput,
  TaskUpdateInput,
} from "../../../backend.d";
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
  outputData: string;
  status: TaskStatus;
}

const DEFAULT_FORM: TaskFormState = {
  title: "",
  description: "",
  priority: TaskPriority.medium,
  language: "en",
  tagsRaw: "",
  agentId: "",
  inputData: "",
  outputData: "",
  status: TaskStatus.pending,
};

function TaskFormFields({
  form,
  onChange,
  agents,
  idPrefix,
  showStatus = false,
}: {
  form: TaskFormState;
  onChange: (f: TaskFormState) => void;
  agents: AgentDefinition[];
  idPrefix: string;
  showStatus?: boolean;
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
          placeholder="e.g. Analyze Q3 Customer Feedback"
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
          placeholder="Describe what needs to be accomplished..."
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

      {showStatus && (
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              onChange({ ...form, status: v as TaskStatus })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.values(TaskStatus).map((s) => (
                <SelectItem key={s} value={s}>
                  {STATUS_CONFIG[s]?.label ?? s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-tags`}>Tags</Label>
        <Input
          id={`${idPrefix}-tags`}
          placeholder="analytics, q3, priority-client (comma-separated)"
          value={form.tagsRaw}
          onChange={(e) => onChange({ ...form, tagsRaw: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label>Assign to Agent (optional)</Label>
        <Select
          value={form.agentId || "__none__"}
          onValueChange={(v) =>
            onChange({ ...form, agentId: v === "__none__" ? "" : v })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Unassigned" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Unassigned</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-input`}>Input Data (optional)</Label>
        <Textarea
          id={`${idPrefix}-input`}
          placeholder="Data or context to pass to the agent..."
          rows={2}
          value={form.inputData}
          onChange={(e) => onChange({ ...form, inputData: e.target.value })}
          className="resize-none"
        />
      </div>

      {showStatus && (
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-output`}>Output Data (optional)</Label>
          <Textarea
            id={`${idPrefix}-output`}
            placeholder="Result or output from the agent..."
            rows={2}
            value={form.outputData}
            onChange={(e) => onChange({ ...form, outputData: e.target.value })}
            className="resize-none"
          />
        </div>
      )}
    </div>
  );
}

function RowSkeleton() {
  return (
    <tr>
      <td className="px-3 py-3">
        <Skeleton className="h-4 w-4 rounded" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-40" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-24" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-20 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-5 w-16 rounded-full" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-4 w-20" />
      </td>
      <td className="px-4 py-3">
        <Skeleton className="h-7 w-24" />
      </td>
    </tr>
  );
}

export default function TaskManagement() {
  const { actor } = useActor(createActor);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  // Bulk selection
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkStatus, setBulkStatus] = useState<TaskStatus>(TaskStatus.pending);
  const [bulkUpdating, setBulkUpdating] = useState(false);

  // Dialogs
  const [createOpen, setCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Task | null>(null);
  const [assignTarget, setAssignTarget] = useState<Task | null>(null);
  const [assignAgentId, setAssignAgentId] = useState("");

  const [createForm, setCreateForm] = useState<TaskFormState>(DEFAULT_FORM);
  const [editForm, setEditForm] = useState<TaskFormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState<string | null>(null);
  const [confirmStatus, setConfirmStatus] = useState<{
    taskId: string;
    newStatus: TaskStatus;
  } | null>(null);

  const loadData = useCallback(async () => {
    if (!actor) return;
    try {
      const orgResult = await actor.getMyOrganization();
      if (!orgResult) {
        toast.error("No organization found");
        setLoading(false);
        return;
      }
      const [tasksResult, agentsResult] = await Promise.all([
        actor.getTasksByOrg(orgResult.id),
        actor.getAgentsByOrg(orgResult.id),
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
      if (agentsResult.__kind__ === "ok") {
        setAgents(agentsResult.ok);
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

  const setStatusFilterAndClear = (value: string) => {
    setStatusFilter(value);
    setSelectedIds(new Set());
  };

  const setPriorityFilterAndClear = (value: string) => {
    setPriorityFilter(value);
    setSelectedIds(new Set());
  };

  const agentName = (agentId?: string) =>
    agentId
      ? (agents.find((a) => a.id === agentId)?.name ?? "Unknown Agent")
      : null;

  const filtered = tasks.filter((t) => {
    const statusMatch = statusFilter === "all" || t.status === statusFilter;
    const priorityMatch =
      priorityFilter === "all" || t.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const allFilteredSelected =
    filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));
  const someFilteredSelected = filtered.some((t) => selectedIds.has(t.id));

  const toggleSelectAll = () => {
    if (allFilteredSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((t) => t.id)));
    }
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleBulkStatusUpdate = async () => {
    if (!actor || selectedIds.size === 0) return;
    setBulkUpdating(true);
    const ids = Array.from(selectedIds);
    let updatedCount = 0;
    try {
      // Try bulk API first
      try {
        const result = await (actor as any).bulkUpdateTaskStatus(
          ids,
          bulkStatus,
        );
        if (
          result &&
          (result.updated !== undefined || result.__kind__ === "ok")
        ) {
          updatedCount = result.updated ?? ids.length;
        } else {
          throw new Error("bulk API unavailable");
        }
      } catch {
        // Fallback: update individually
        const results = await Promise.allSettled(
          ids.map((id) => actor.updateTaskStatus(id, bulkStatus)),
        );
        updatedCount = results.filter(
          (r) => r.status === "fulfilled" && (r.value as any).__kind__ === "ok",
        ).length;
      }
      await loadData();
      setSelectedIds(new Set());
      toast.success(
        `${updatedCount} task${updatedCount !== 1 ? "s" : ""} updated`,
      );
    } catch (_e) {
      toast.error("Failed to update tasks");
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleCreate = async () => {
    if (!actor) return;
    if (!createForm.title.trim() || !createForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const input: TaskInput = {
        title: createForm.title.trim(),
        description: createForm.description.trim(),
        priority: createForm.priority,
        language: createForm.language,
        tags: parseTags(createForm.tagsRaw),
        assignedAgentId: createForm.agentId || undefined,
        inputData: createForm.inputData.trim() || undefined,
      };
      const result = await actor.createTask(input);
      if (result.__kind__ === "ok") {
        setTasks((prev) => [result.ok, ...prev]);
        setCreateOpen(false);
        setCreateForm(DEFAULT_FORM);
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

  const openEdit = (task: Task) => {
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      language: task.language,
      tagsRaw: task.tags.join(", "),
      agentId: task.assignedAgentId ?? "",
      inputData: task.inputData ?? "",
      outputData: task.outputData ?? "",
      status: task.status,
    });
    setEditTarget(task);
  };

  const handleEdit = async () => {
    if (!actor || !editTarget) return;
    if (!editForm.title.trim() || !editForm.description.trim()) {
      toast.error("Title and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const input: TaskUpdateInput = {
        title: editForm.title.trim(),
        description: editForm.description.trim(),
        priority: editForm.priority,
        language: editForm.language,
        tags: parseTags(editForm.tagsRaw),
        assignedAgentId: editForm.agentId || undefined,
        inputData: editForm.inputData.trim() || undefined,
        outputData: editForm.outputData.trim() || undefined,
        status: editForm.status,
      };
      const result = await actor.updateTask(editTarget.id, input);
      if (result.__kind__ === "ok") {
        setTasks((prev) =>
          prev.map((t) => (t.id === editTarget.id ? result.ok : t)),
        );
        setEditTarget(null);
        toast.success(`Task "${result.ok.title}" updated`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to update task");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAssignAgent = async () => {
    if (!actor || !assignTarget || !assignAgentId) return;
    setAssigning(true);
    try {
      const result = await actor.assignTaskToAgent(
        assignTarget.id,
        assignAgentId,
      );
      if (result.__kind__ === "ok") {
        setTasks((prev) =>
          prev.map((t) => (t.id === assignTarget.id ? result.ok : t)),
        );
        setAssignTarget(null);
        setAssignAgentId("");
        toast.success("Agent assigned to task");
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to assign agent");
    } finally {
      setAssigning(false);
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

  return (
    <div className="space-y-6 pb-24">
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

      {/* Assign agent dialog */}
      <AlertDialog
        open={!!assignTarget}
        onOpenChange={(open) => !open && setAssignTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Assign to Agent
            </AlertDialogTitle>
            <AlertDialogDescription>
              Select an AI agent to handle{" "}
              <strong className="text-foreground">{assignTarget?.title}</strong>
              .
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Select
              value={assignAgentId || "__none__"}
              onValueChange={(v) => setAssignAgentId(v === "__none__" ? "" : v)}
            >
              <SelectTrigger data-ocid="task.select">
                <SelectValue placeholder="Choose an agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">Select agent...</SelectItem>
                {agents.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel
              data-ocid="task.cancel_button"
              onClick={() => setAssignAgentId("")}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="task.confirm_button"
              disabled={assigning || !assignAgentId}
              onClick={handleAssignAgent}
            >
              {assigning ? "Assigning..." : "Assign Agent"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit dialog */}
      <Dialog
        open={!!editTarget}
        onOpenChange={(open) => !open && setEditTarget(null)}
      >
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Task</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <TaskFormFields
              form={editForm}
              onChange={setEditForm}
              agents={agents}
              idPrefix="edit-task"
              showStatus
            />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditTarget(null)}
              data-ocid="task.cancel_button"
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              data-ocid="task.save_button"
              onClick={handleEdit}
              disabled={
                submitting ||
                !editForm.title.trim() ||
                !editForm.description.trim()
              }
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold flex items-center gap-2">
            <ListTodo className="w-6 h-6 text-primary" />
            Task Management
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} in your
            organization
          </p>
        </div>
        <Dialog
          open={createOpen}
          onOpenChange={(open) => {
            setCreateOpen(open);
            if (!open) setCreateForm(DEFAULT_FORM);
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
                form={createForm}
                onChange={setCreateForm}
                agents={agents}
                idPrefix="create-task"
              />
            </div>
            <Button
              className="w-full mt-2"
              data-ocid="task.submit_button"
              onClick={handleCreate}
              disabled={
                submitting ||
                !createForm.title.trim() ||
                !createForm.description.trim()
              }
            >
              {submitting ? "Creating..." : "Create Task"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter bar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">
            Status:
          </span>
          {["all", ...Object.values(TaskStatus)].map((s) => (
            <Button
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setStatusFilterAndClear(s)}
              data-ocid="task.tab"
            >
              {s === "all" ? "All" : (STATUS_CONFIG[s]?.label ?? s)}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground font-medium">
            Priority:
          </span>
          {["all", ...Object.values(TaskPriority)].map((p) => (
            <Button
              key={p}
              variant={priorityFilter === p ? "default" : "outline"}
              size="sm"
              className="text-xs h-7"
              onClick={() => setPriorityFilterAndClear(p)}
              data-ocid="task.tab"
            >
              {p === "all" ? "All" : (PRIORITY_CONFIG[p]?.label ?? p)}
            </Button>
          ))}
        </div>
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const exportData = filtered.map((t) => ({
                title: t.title,
                status: t.status,
                priority: t.priority,
                assignedAgentId: t.assignedAgentId ?? "",
                createdAt: new Date(
                  Number(t.createdAt) / 1_000_000,
                ).toISOString(),
              }));
              exportToCSV(exportData, "tasks", [
                { key: "title", label: "Title" },
                { key: "status", label: "Status" },
                { key: "priority", label: "Priority" },
                { key: "assignedAgentId", label: "Agent ID" },
                { key: "createdAt", label: "Created At" },
              ]);
            }}
            title="Export CSV"
            data-ocid="task.secondary_button"
          >
            <Download className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Selection info bar */}
      {someFilteredSelected && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>
            {selectedIds.size} task{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <button
            type="button"
            className="underline hover:text-foreground transition-colors"
            onClick={() => setSelectedIds(new Set())}
          >
            Clear selection
          </button>
        </div>
      )}

      {/* Task table */}
      {loading ? (
        <div
          className="rounded-lg border border-border/60 overflow-hidden"
          data-ocid="task.loading_state"
        >
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2.5 w-10" />
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Agent
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Created
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {[1, 2, 3, 4].map((i) => (
                <RowSkeleton key={i} />
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-16 text-center border border-border/60 rounded-lg"
          data-ocid="task.empty_state"
        >
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">
            {statusFilter === "all" && priorityFilter === "all"
              ? "No tasks yet"
              : "No tasks match these filters"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {statusFilter === "all" && priorityFilter === "all"
              ? "Create a task above or assign one to an agent."
              : "Try adjusting the status or priority filters."}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border border-border/60 overflow-hidden">
          <table className="w-full">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-3 py-2.5 w-10">
                  <Checkbox
                    checked={allFilteredSelected}
                    data-state={
                      someFilteredSelected && !allFilteredSelected
                        ? "indeterminate"
                        : undefined
                    }
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all tasks"
                    data-ocid="task.checkbox"
                  />
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Title
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Agent
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Priority
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Created
                </th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {filtered.map((task, idx) => (
                <tr
                  key={task.id}
                  className={`hover:bg-muted/10 transition-colors ${
                    selectedIds.has(task.id) ? "bg-primary/5" : ""
                  }`}
                  data-ocid={`task.row.${idx + 1}`}
                >
                  <td className="px-3 py-3">
                    <Checkbox
                      checked={selectedIds.has(task.id)}
                      onCheckedChange={() => toggleSelectOne(task.id)}
                      aria-label={`Select task ${task.title}`}
                      data-ocid={`task.checkbox.${idx + 1}`}
                    />
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div>
                      <p className="text-sm font-medium truncate">
                        {task.title}
                      </p>
                      {task.tags.length > 0 && (
                        <div className="flex gap-1 mt-0.5 flex-wrap">
                          {task.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="text-xs bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground"
                            >
                              {tag}
                            </span>
                          ))}
                          {task.tags.length > 2 && (
                            <span className="text-xs text-muted-foreground">
                              +{task.tags.length - 2}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {agentName(task.assignedAgentId) ? (
                      <span className="inline-flex items-center gap-1 text-xs">
                        <Bot className="w-3 h-3 text-primary" />
                        <span className="text-muted-foreground">
                          {agentName(task.assignedAgentId)}
                        </span>
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">
                        —
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <Select
                      value={task.status}
                      disabled={statusUpdating === task.id}
                      onValueChange={(v) =>
                        setConfirmStatus({
                          taskId: task.id,
                          newStatus: v as TaskStatus,
                        })
                      }
                    >
                      <SelectTrigger
                        className="h-7 text-xs w-36"
                        data-ocid={"task.select"}
                      >
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.values(TaskStatus).map((s) => (
                          <SelectItem key={s} value={s} className="text-xs">
                            <span
                              className={`inline-flex items-center gap-1 ${STATUS_CONFIG[s]?.className ?? ""}`}
                            >
                              {STATUS_CONFIG[s]?.label ?? s}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        PRIORITY_CONFIG[task.priority]?.className ?? ""
                      }`}
                    >
                      {PRIORITY_CONFIG[task.priority]?.label ?? task.priority}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(task.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        data-ocid={`task.edit_button.${idx + 1}`}
                        onClick={() => openEdit(task)}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        data-ocid={`task.secondary_button.${idx + 1}`}
                        onClick={() => {
                          setAssignTarget(task);
                          setAssignAgentId(task.assignedAgentId ?? "");
                        }}
                      >
                        <Bot className="w-3.5 h-3.5 mr-1" />
                        Agent
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating bulk action toolbar */}
      {selectedIds.size > 0 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border border-border/80 bg-card shadow-2xl shadow-black/40"
          data-ocid="task.panel"
        >
          <span className="text-sm font-medium text-foreground whitespace-nowrap">
            {selectedIds.size} task{selectedIds.size !== 1 ? "s" : ""} selected
          </span>
          <div className="w-px h-5 bg-border" />
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              Change Status:
            </span>
            <Select
              value={bulkStatus}
              onValueChange={(v) => setBulkStatus(v as TaskStatus)}
            >
              <SelectTrigger
                className="h-8 text-xs w-36"
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
          <Button
            size="sm"
            className="h-8 px-3 text-xs gap-1.5"
            disabled={bulkUpdating}
            onClick={handleBulkStatusUpdate}
            data-ocid="task.primary_button"
          >
            {bulkUpdating ? (
              <span className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                Updating...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" />
                Apply
              </span>
            )}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
            onClick={() => setSelectedIds(new Set())}
            aria-label="Clear selection"
            data-ocid="task.cancel_button"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
