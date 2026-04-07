import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { useActor } from "@caffeineai/core-infrastructure";
import { ClipboardList, Plus, SendHorizonal } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { Task, TaskInput } from "../../../backend.d";
import { TaskPriority, type TaskStatus } from "../../../backend.d";

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

const STATUS_FILTERS = ["all", "pending", "in_progress", "completed"];

const formatDate = (ts: bigint) =>
  new Date(Number(ts) / 1_000_000).toLocaleDateString();

const parseTags = (s: string) =>
  s
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

interface RequestFormState {
  title: string;
  description: string;
  priority: TaskPriority;
  language: string;
  tagsRaw: string;
}

const DEFAULT_FORM: RequestFormState = {
  title: "",
  description: "",
  priority: TaskPriority.low,
  language: "en",
  tagsRaw: "",
};

function CardSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-border/60">
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-64" />
        <Skeleton className="h-3 w-24" />
      </div>
      <Skeleton className="h-5 w-20 rounded-full" />
    </div>
  );
}

export default function MyRequests() {
  const { actor } = useActor(createActor);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState<RequestFormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);

  const loadTasks = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.getMyTasks();
      if (result.__kind__ === "ok") {
        setTasks(
          [...result.ok].sort(
            (a, b) => Number(b.createdAt) - Number(a.createdAt),
          ),
        );
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to load requests");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const handleSubmit = async () => {
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
      };
      const result = await actor.createTask(input);
      if (result.__kind__ === "ok") {
        setTasks((prev) => [result.ok, ...prev]);
        setCreateOpen(false);
        setForm(DEFAULT_FORM);
        toast.success("Request submitted successfully");
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = tasks.filter(
    (t) => filter === "all" || t.status === (filter as TaskStatus),
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">My Requests</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All your submitted service requests
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
            <Button size="sm" data-ocid="request.primary_button">
              <Plus className="w-4 h-4 mr-1.5" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">
                Submit Service Request
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label htmlFor="req-title">
                  Title <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="req-title"
                  data-ocid="request.input"
                  placeholder="What do you need help with?"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="req-desc">
                  Description <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="req-desc"
                  data-ocid="request.textarea"
                  placeholder="Describe your request in detail..."
                  rows={3}
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={form.priority}
                    onValueChange={(v) =>
                      setForm({ ...form, priority: v as TaskPriority })
                    }
                  >
                    <SelectTrigger data-ocid="request.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={TaskPriority.low}>Low</SelectItem>
                      <SelectItem value={TaskPriority.medium}>
                        Medium
                      </SelectItem>
                      <SelectItem value={TaskPriority.high}>High</SelectItem>
                      <SelectItem value={TaskPriority.urgent}>
                        Urgent
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select
                    value={form.language}
                    onValueChange={(v) => setForm({ ...form, language: v })}
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
                <Label htmlFor="req-tags">Tags (optional)</Label>
                <Input
                  id="req-tags"
                  placeholder="billing, urgent, account (comma-separated)"
                  value={form.tagsRaw}
                  onChange={(e) =>
                    setForm({ ...form, tagsRaw: e.target.value })
                  }
                />
              </div>

              <Button
                className="w-full"
                data-ocid="request.submit_button"
                onClick={handleSubmit}
                disabled={
                  submitting || !form.title.trim() || !form.description.trim()
                }
              >
                {submitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <SendHorizonal className="w-4 h-4 mr-1.5" />
                    Submit Request
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1.5 flex-wrap" data-ocid="request.filter.tab">
        {STATUS_FILTERS.map((f) => (
          <Button
            key={f}
            variant={filter === f ? "default" : "outline"}
            size="sm"
            className="text-xs h-7"
            onClick={() => setFilter(f)}
            data-ocid="request.tab"
          >
            {f === "all"
              ? "All"
              : f.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Button>
        ))}
      </div>

      {/* Request cards */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="py-16 text-center border border-border/60 rounded-lg"
          data-ocid="request.empty_state"
        >
          <ClipboardList className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium">No requests yet</p>
          <p className="text-xs text-muted-foreground mt-1">
            {filter === "all"
              ? "Submit your first service request above."
              : "Try a different status filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task, idx) => (
            <div
              key={task.id}
              className="flex items-start gap-3 p-4 rounded-lg border border-border/60 hover:bg-muted/10 transition-colors"
              data-ocid={`request.item.${idx + 1}`}
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{task.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                  {task.description}
                </p>
                {task.tags.length > 0 && (
                  <div className="flex gap-1 mt-1.5 flex-wrap">
                    {task.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs h-4 px-1.5"
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1.5">
                  Submitted {formatDate(task.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    STATUS_CONFIG[task.status]?.className ?? ""
                  }`}
                >
                  {STATUS_CONFIG[task.status]?.label ?? task.status}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs ${
                    PRIORITY_CONFIG[task.priority]?.className ?? ""
                  }`}
                >
                  {PRIORITY_CONFIG[task.priority]?.label ?? task.priority}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
