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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@/hooks/useActor";
import {
  Globe,
  Hash,
  LayoutTemplate,
  Link,
  Loader2,
  Lock,
  Plus,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import type { AgentTemplate, AgentTemplateInput } from "../../../backend.d";

interface CreateFormState {
  name: string;
  description: string;
  systemPrompt: string;
  endpointUrl: string;
  endpointHeaders: string;
  tags: string;
  isPublic: boolean;
}

const DEFAULT_FORM: CreateFormState = {
  name: "",
  description: "",
  systemPrompt: "",
  endpointUrl: "",
  endpointHeaders: "",
  tags: "",
  isPublic: true,
};

function TemplateSkeleton() {
  return (
    <TableRow>
      <TableCell>
        <Skeleton className="h-4 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-48" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-36" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-16 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-20 rounded-full" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-7 w-7 rounded" />
      </TableCell>
    </TableRow>
  );
}

export default function AgentTemplates() {
  const { actor } = useActor();
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<AgentTemplate | null>(null);
  const [createForm, setCreateForm] = useState<CreateFormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const loadTemplates = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.getAgentTemplates(null);
      if (result.__kind__ === "ok") {
        setTemplates(result.ok);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to load agent templates");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadTemplates();
  }, [loadTemplates]);

  const handleCreate = async () => {
    if (!actor) return;
    if (!createForm.name.trim() || !createForm.description.trim()) {
      toast.error("Name and description are required");
      return;
    }
    setSubmitting(true);
    try {
      const input: AgentTemplateInput = {
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        systemPrompt: createForm.systemPrompt.trim() || undefined,
        endpointUrl: createForm.endpointUrl.trim() || undefined,
        endpointHeaders: createForm.endpointHeaders.trim() || undefined,
        tags: createForm.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        isPublic: createForm.isPublic,
        orgId: undefined,
      };
      const result = await actor.createAgentTemplate(input);
      if (result.__kind__ === "ok") {
        setTemplates((prev) => [result.ok, ...prev]);
        setCreateOpen(false);
        setCreateForm(DEFAULT_FORM);
        toast.success(`Template "${result.ok.name}" created`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to create template");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!actor || !deleteTarget) return;
    setDeleting(true);
    try {
      const result = await actor.deleteAgentTemplate(deleteTarget.id);
      if (result.__kind__ === "ok") {
        setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
        setDeleteTarget(null);
        toast.success(`Template "${deleteTarget.name}" deleted`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to delete template");
    } finally {
      setDeleting(false);
    }
  };

  const publicCount = templates.filter((t) => t.isPublic).length;
  const privateCount = templates.filter((t) => !t.isPublic).length;

  const formatDate = (ts: bigint) => {
    return new Date(Number(ts) / 1_000_000).toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Delete Template
            </AlertDialogTitle>
            <AlertDialogDescription>
              Delete{" "}
              <strong className="text-foreground">{deleteTarget?.name}</strong>?
              Orgs using this template won't lose their cloned agents, but the
              template will be removed from the marketplace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="agent_templates.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="agent_templates.confirm_button"
              onClick={handleDelete}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? "Deleting..." : "Delete Template"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Dialog */}
      <Dialog
        open={createOpen}
        onOpenChange={(open) => {
          setCreateOpen(open);
          if (!open) setCreateForm(DEFAULT_FORM);
        }}
      >
        <DialogContent
          className="max-w-lg max-h-[85vh] overflow-y-auto"
          data-ocid="agent_templates.dialog"
        >
          <DialogHeader>
            <DialogTitle className="font-display">
              New Agent Template
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <div className="space-y-2">
              <Label htmlFor="tmpl-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="tmpl-name"
                data-ocid="agent_templates.input"
                placeholder="e.g. Customer Support Bot"
                value={createForm.name}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmpl-desc">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="tmpl-desc"
                data-ocid="agent_templates.textarea"
                placeholder="What does this template help agents do?"
                rows={2}
                value={createForm.description}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    description: e.target.value,
                  }))
                }
                className="resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmpl-prompt">System Prompt (optional)</Label>
              <Textarea
                id="tmpl-prompt"
                placeholder="You are a helpful assistant that..."
                rows={3}
                value={createForm.systemPrompt}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    systemPrompt: e.target.value,
                  }))
                }
                className="resize-none font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmpl-endpoint">Endpoint URL (optional)</Label>
              <Input
                id="tmpl-endpoint"
                placeholder="https://api.example.com/v1/chat"
                value={createForm.endpointUrl}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    endpointUrl: e.target.value,
                  }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmpl-headers">
                Endpoint Headers JSON (optional)
              </Label>
              <Textarea
                id="tmpl-headers"
                placeholder='{"Authorization": "Bearer ..."}'
                rows={2}
                value={createForm.endpointHeaders}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    endpointHeaders: e.target.value,
                  }))
                }
                className="resize-none font-mono text-xs"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tmpl-tags">
                Tags (comma-separated, optional)
              </Label>
              <Input
                id="tmpl-tags"
                placeholder="e.g. support, faq, automation"
                value={createForm.tags}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, tags: e.target.value }))
                }
              />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border/60 p-3">
              <div>
                <p className="text-sm font-medium">Public Template</p>
                <p className="text-xs text-muted-foreground">
                  Visible to all organizations in the marketplace
                </p>
              </div>
              <Switch
                data-ocid="agent_templates.switch"
                checked={createForm.isPublic}
                onCheckedChange={(v) =>
                  setCreateForm((f) => ({ ...f, isPublic: v }))
                }
              />
            </div>

            <Button
              className="w-full"
              data-ocid="agent_templates.submit_button"
              onClick={handleCreate}
              disabled={
                submitting ||
                !createForm.name.trim() ||
                !createForm.description.trim()
              }
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Template"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Agent Templates
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage platform-wide agent templates for the marketplace
          </p>
        </div>
        <Button
          size="sm"
          data-ocid="agent_templates.primary_button"
          onClick={() => setCreateOpen(true)}
        >
          <Plus className="w-4 h-4 mr-1.5" />
          New Template
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Total Templates
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-display font-bold">
              {loading ? <Skeleton className="h-8 w-12" /> : templates.length}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Public
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-display font-bold text-teal-400">
              {loading ? <Skeleton className="h-8 w-8" /> : publicCount}
            </p>
          </CardContent>
        </Card>
        <Card className="border-border/60">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
              Private
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-2xl font-display font-bold text-muted-foreground">
              {loading ? <Skeleton className="h-8 w-8" /> : privateCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card className="border-border/60" data-ocid="agent_templates.table">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead>Name</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Tags</TableHead>
                <TableHead>Visibility</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="w-16">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <TemplateSkeleton key={i} />
                  ))}
                </>
              ) : templates.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="text-center py-16"
                    data-ocid="agent_templates.empty_state"
                  >
                    <LayoutTemplate className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm font-medium">No templates yet</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Create the first platform-wide agent template.
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                templates.map((tpl, idx) => (
                  <TableRow
                    key={tpl.id}
                    className="border-border/60"
                    data-ocid={`agent_templates.row.${idx + 1}`}
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded bg-primary/10 shrink-0">
                          <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
                        </div>
                        <span className="font-display font-semibold text-sm">
                          {tpl.name}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                        {tpl.description}
                      </p>
                    </TableCell>
                    <TableCell>
                      {tpl.endpointUrl ? (
                        <div className="flex items-center gap-1 text-xs text-teal-400">
                          <Link className="w-3 h-3" />
                          <span className="max-w-[120px] truncate font-mono">
                            {tpl.endpointUrl}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {tpl.tags.slice(0, 3).map((tag) => (
                          <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs flex items-center gap-0.5"
                          >
                            <Hash className="w-2.5 h-2.5" />
                            {tag}
                          </Badge>
                        ))}
                        {tpl.tags.length > 3 && (
                          <span className="text-xs text-muted-foreground">
                            +{tpl.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {tpl.isPublic ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30"
                        >
                          <Globe className="w-2.5 h-2.5 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-muted text-muted-foreground"
                        >
                          <Lock className="w-2.5 h-2.5 mr-1" />
                          Private
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {formatDate(tpl.createdAt)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-ocid={`agent_templates.delete_button.${idx + 1}`}
                        onClick={() => setDeleteTarget(tpl)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
