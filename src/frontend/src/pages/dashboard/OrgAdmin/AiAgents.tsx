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
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import {
  Activity,
  Bot,
  ChevronDown,
  ChevronRight,
  Cpu,
  Globe,
  Hash,
  LayoutTemplate,
  Link,
  Loader2,
  Lock,
  MessageSquare,
  Pencil,
  Plus,
  PowerOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { AgentDefinition, AgentTemplate } from "../../../backend.d";
import { AgentStatus } from "../../../backend.d";
import { AgentChatDrawer } from "../../../components/AgentChatDrawer";

const STATUS_CONFIG: Record<string, string> = {
  active: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  inactive: "bg-muted text-muted-foreground border-border",
  training: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const CAPABILITY_OPTIONS = [
  "customer-service",
  "faq-answering",
  "ticket-routing",
  "escalation",
  "data-analysis",
  "report-generation",
  "trend-detection",
  "code-generation",
  "translation",
  "content-moderation",
];

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "zh", label: "普通话" },
  { value: "ar", label: "العربية" },
  { value: "pt", label: "Português" },
  { value: "sw", label: "Kiswahili" },
];

interface AgentFormState {
  name: string;
  description: string;
  modelType: string;
  endpointUrl: string;
  capabilities: string[];
  supportedLanguages: string[];
  status: AgentStatus;
}

const DEFAULT_FORM: AgentFormState = {
  name: "",
  description: "",
  modelType: "",
  endpointUrl: "",
  capabilities: [],
  supportedLanguages: ["en"],
  status: AgentStatus.active,
};

function AgentForm({
  form,
  onChange,
  idPrefix,
}: {
  form: AgentFormState;
  onChange: (f: AgentFormState) => void;
  idPrefix: string;
}) {
  const toggleCap = (cap: string) => {
    onChange({
      ...form,
      capabilities: form.capabilities.includes(cap)
        ? form.capabilities.filter((c) => c !== cap)
        : [...form.capabilities, cap],
    });
  };

  const toggleLang = (lang: string) => {
    onChange({
      ...form,
      supportedLanguages: form.supportedLanguages.includes(lang)
        ? form.supportedLanguages.filter((l) => l !== lang)
        : [...form.supportedLanguages, lang],
    });
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-name`}>
          Agent Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id={`${idPrefix}-name`}
          data-ocid="agent.input"
          placeholder="e.g. SupportBot Alpha"
          value={form.name}
          onChange={(e) => onChange({ ...form, name: e.target.value })}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-description`}>
          Description <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id={`${idPrefix}-description`}
          data-ocid="agent.textarea"
          placeholder="What does this agent do?"
          rows={2}
          value={form.description}
          onChange={(e) => onChange({ ...form, description: e.target.value })}
          className="resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor={`${idPrefix}-model`}>
            Model Type <span className="text-destructive">*</span>
          </Label>
          <Input
            id={`${idPrefix}-model`}
            placeholder="e.g. GPT-4, Claude 3.5"
            value={form.modelType}
            onChange={(e) => onChange({ ...form, modelType: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={form.status}
            onValueChange={(v) =>
              onChange({ ...form, status: v as AgentStatus })
            }
          >
            <SelectTrigger data-ocid="agent.select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={AgentStatus.active}>Active</SelectItem>
              <SelectItem value={AgentStatus.inactive}>Inactive</SelectItem>
              <SelectItem value={AgentStatus.training}>Training</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-endpoint`}>Endpoint URL</Label>
        <Input
          id={`${idPrefix}-endpoint`}
          placeholder="https://api.example.com/v1/chat (optional)"
          value={form.endpointUrl}
          onChange={(e) => onChange({ ...form, endpointUrl: e.target.value })}
        />
        <p className="text-xs text-muted-foreground">
          Generic REST endpoint for HTTP outcalls (POST/JSON)
        </p>
      </div>

      <div className="space-y-2">
        <Label>Capabilities</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {CAPABILITY_OPTIONS.map((cap) => {
            const capId = `${idPrefix}-cap-${cap}`;
            return (
              <div
                key={cap}
                className="flex items-center gap-2 cursor-pointer p-1.5 rounded hover:bg-muted/50 transition-colors"
              >
                <Checkbox
                  id={capId}
                  checked={form.capabilities.includes(cap)}
                  onCheckedChange={() => toggleCap(cap)}
                />
                <Label
                  htmlFor={capId}
                  className="text-xs font-normal cursor-pointer"
                >
                  {cap}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-2">
        <Label>Supported Languages</Label>
        <div className="flex flex-wrap gap-1.5">
          {LANGUAGE_OPTIONS.map((lang) => {
            const langId = `${idPrefix}-lang-${lang.value}`;
            return (
              <div
                key={lang.value}
                className="flex items-center gap-1.5 cursor-pointer px-2 py-1 rounded-md border border-border/40 hover:border-border/70 transition-colors"
              >
                <Checkbox
                  id={langId}
                  checked={form.supportedLanguages.includes(lang.value)}
                  onCheckedChange={() => toggleLang(lang.value)}
                  className="w-3 h-3"
                />
                <Label
                  htmlFor={langId}
                  className="text-xs font-normal cursor-pointer"
                >
                  {lang.label}
                </Label>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function AgentCardSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-5 w-16 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32 mb-1" />
        <Skeleton className="h-3 w-48 mb-3" />
        <Skeleton className="h-3 w-24 mb-3" />
        <div className="flex gap-1.5">
          <Skeleton className="h-5 w-20 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}

function TemplateCardSkeleton() {
  return (
    <Card className="border-border/60 min-w-[220px] max-w-[260px]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
        <Skeleton className="h-4 w-28 mb-1.5" />
        <Skeleton className="h-3 w-full mb-1" />
        <Skeleton className="h-3 w-3/4 mb-3" />
        <Skeleton className="h-7 w-full rounded" />
      </CardContent>
    </Card>
  );
}

interface CloneDialogProps {
  template: AgentTemplate;
  orgId: string;
  onCloneSuccess: (agent: AgentDefinition) => void;
  onClose: () => void;
}

function CloneDialog({
  template,
  orgId,
  onCloneSuccess,
  onClose,
}: CloneDialogProps) {
  const { actor } = useActor(createActor);
  const [cloneName, setCloneName] = useState(template.name);
  const [cloneEndpoint, setCloneEndpoint] = useState(
    template.endpointUrl ?? "",
  );
  const [cloning, setCloning] = useState(false);

  const handleClone = async () => {
    if (!actor) return;
    setCloning(true);
    try {
      const result = await actor.cloneAgentFromTemplate(
        template.id,
        orgId,
        cloneName.trim() !== template.name ? cloneName.trim() : null,
        cloneEndpoint.trim() !== (template.endpointUrl ?? "")
          ? cloneEndpoint.trim() || null
          : null,
      );
      if (result.__kind__ === "ok") {
        onCloneSuccess(result.ok);
        toast.success(`Agent "${result.ok.name}" created from template`);
        onClose();
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to clone template");
    } finally {
      setCloning(false);
    }
  };

  return (
    <div className="space-y-4 mt-2">
      <div className="space-y-2">
        <Label>Template Description</Label>
        <p className="text-xs text-muted-foreground bg-muted/40 rounded-md p-2.5 border border-border/40">
          {template.description}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="clone-name">Agent Name</Label>
        <Input
          id="clone-name"
          data-ocid="template_clone.input"
          value={cloneName}
          onChange={(e) => setCloneName(e.target.value)}
          placeholder={template.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="clone-endpoint">Endpoint URL</Label>
        <Input
          id="clone-endpoint"
          value={cloneEndpoint}
          onChange={(e) => setCloneEndpoint(e.target.value)}
          placeholder={
            template.endpointUrl ?? "https://api.example.com/v1/chat"
          }
        />
        <p className="text-xs text-muted-foreground">
          Override the default endpoint for this agent instance
        </p>
      </div>

      {template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs">
              <Hash className="w-2.5 h-2.5 mr-0.5" />
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="flex gap-2 pt-1">
        <Button
          variant="outline"
          className="flex-1"
          onClick={onClose}
          disabled={cloning}
        >
          Cancel
        </Button>
        <Button
          className="flex-1"
          data-ocid="template_clone.submit_button"
          onClick={handleClone}
          disabled={cloning || !cloneName.trim()}
        >
          {cloning ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            "Create Agent"
          )}
        </Button>
      </div>
    </div>
  );
}

export default function AiAgents() {
  const { actor } = useActor(createActor);
  const [agents, setAgents] = useState<AgentDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [registerOpen, setRegisterOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AgentDefinition | null>(null);
  const [deactivateTarget, setDeactivateTarget] =
    useState<AgentDefinition | null>(null);
  const [chatTarget, setChatTarget] = useState<AgentDefinition | null>(null);
  const [registerForm, setRegisterForm] =
    useState<AgentFormState>(DEFAULT_FORM);
  const [editForm, setEditForm] = useState<AgentFormState>(DEFAULT_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [deactivating, setDeactivating] = useState(false);

  // Template section state
  const [templates, setTemplates] = useState<AgentTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(true);
  const [templateSectionOpen, setTemplateSectionOpen] = useState(true);
  const [cloneDialogTemplate, setCloneDialogTemplate] =
    useState<AgentTemplate | null>(null);
  const [orgId, setOrgId] = useState<string>("");

  const loadAgents = useCallback(async () => {
    if (!actor) return;
    try {
      const orgResult = await actor.getMyOrganization();
      if (!orgResult) {
        toast.error("No organization found");
        setLoading(false);
        return;
      }
      setOrgId(orgResult.id);
      const [agentResult, templateResult] = await Promise.all([
        actor.getAgentsByOrg(orgResult.id),
        actor.getAgentTemplates(orgResult.id),
      ]);
      if (agentResult.__kind__ === "ok") {
        setAgents(agentResult.ok);
      } else {
        toast.error(agentResult.err);
      }
      if (templateResult.__kind__ === "ok") {
        setTemplates(templateResult.ok);
      }
      // silently ignore template errors
    } catch (_e) {
      toast.error("Failed to load agents");
    } finally {
      setLoading(false);
      setTemplatesLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadAgents();
  }, [loadAgents]);

  const handleRegister = async () => {
    if (!actor) return;
    if (
      !registerForm.name.trim() ||
      !registerForm.description.trim() ||
      !registerForm.modelType.trim()
    ) {
      toast.error("Name, description, and model type are required");
      return;
    }
    setSubmitting(true);
    try {
      const result = await actor.registerAgent({
        name: registerForm.name.trim(),
        description: registerForm.description.trim(),
        modelType: registerForm.modelType.trim(),
        endpointUrl: registerForm.endpointUrl.trim() || undefined,
        capabilities: registerForm.capabilities,
        supportedLanguages: registerForm.supportedLanguages,
        status: registerForm.status,
      });
      if (result.__kind__ === "ok") {
        setAgents((prev) => [result.ok, ...prev]);
        setRegisterOpen(false);
        setRegisterForm(DEFAULT_FORM);
        toast.success(`Agent "${result.ok.name}" registered`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to register agent");
    } finally {
      setSubmitting(false);
    }
  };

  const openEdit = (agent: AgentDefinition) => {
    setEditForm({
      name: agent.name,
      description: agent.description,
      modelType: agent.modelType,
      endpointUrl: agent.endpointUrl ?? "",
      capabilities: [...agent.capabilities],
      supportedLanguages: [...agent.supportedLanguages],
      status: agent.status,
    });
    setEditTarget(agent);
  };

  const handleEdit = async () => {
    if (!actor || !editTarget) return;
    if (
      !editForm.name.trim() ||
      !editForm.description.trim() ||
      !editForm.modelType.trim()
    ) {
      toast.error("Name, description, and model type are required");
      return;
    }
    setSubmitting(true);
    try {
      const result = await actor.updateAgent(editTarget.id, {
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        modelType: editForm.modelType.trim(),
        endpointUrl: editForm.endpointUrl.trim() || undefined,
        capabilities: editForm.capabilities,
        supportedLanguages: editForm.supportedLanguages,
        status: editForm.status,
      });
      if (result.__kind__ === "ok") {
        setAgents((prev) =>
          prev.map((a) => (a.id === editTarget.id ? result.ok : a)),
        );
        setEditTarget(null);
        toast.success(`Agent "${result.ok.name}" updated`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to update agent");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeactivate = async () => {
    if (!actor || !deactivateTarget) return;
    setDeactivating(true);
    try {
      const result = await actor.deactivateAgent(deactivateTarget.id);
      if (result.__kind__ === "ok") {
        setAgents((prev) =>
          prev.map((a) => (a.id === deactivateTarget.id ? result.ok : a)),
        );
        setDeactivateTarget(null);
        toast.success(`Agent "${result.ok.name}" deactivated`);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to deactivate agent");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Chat drawer */}
      <AgentChatDrawer
        agent={chatTarget}
        open={!!chatTarget}
        onClose={() => setChatTarget(null)}
      />

      {/* Deactivate confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Deactivate Agent
            </AlertDialogTitle>
            <AlertDialogDescription>
              Deactivate{" "}
              <strong className="text-foreground">
                {deactivateTarget?.name}
              </strong>
              ? The agent will stop processing requests until re-activated. This
              can be reversed by editing the agent.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="agent.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              data-ocid="agent.confirm_button"
              onClick={handleDeactivate}
              disabled={deactivating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deactivating ? "Deactivating..." : "Deactivate"}
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
            <DialogTitle className="font-display">Edit Agent</DialogTitle>
          </DialogHeader>
          <div className="mt-2">
            <AgentForm form={editForm} onChange={setEditForm} idPrefix="edit" />
          </div>
          <div className="flex gap-2 pt-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setEditTarget(null)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              data-ocid="agent.save_button"
              onClick={handleEdit}
              disabled={
                submitting ||
                !editForm.name.trim() ||
                !editForm.description.trim() ||
                !editForm.modelType.trim()
              }
            >
              {submitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Clone template dialog */}
      {cloneDialogTemplate && (
        <Dialog
          open={!!cloneDialogTemplate}
          onOpenChange={(open) => !open && setCloneDialogTemplate(null)}
        >
          <DialogContent className="max-w-md" data-ocid="template_clone.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">
                Clone Template: {cloneDialogTemplate.name}
              </DialogTitle>
              <DialogDescription>
                Customize this agent before creating it in your organization.
              </DialogDescription>
            </DialogHeader>
            <CloneDialog
              template={cloneDialogTemplate}
              orgId={orgId}
              onCloneSuccess={(agent) => {
                setAgents((prev) => [agent, ...prev]);
              }}
              onClose={() => setCloneDialogTemplate(null)}
            />
          </DialogContent>
        </Dialog>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">AI Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Swarm agents registered to your organization
          </p>
        </div>
        <Dialog
          open={registerOpen}
          onOpenChange={(open) => {
            setRegisterOpen(open);
            if (!open) setRegisterForm(DEFAULT_FORM);
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="agent.primary_button">
              <Plus className="w-4 h-4 mr-1.5" />
              New Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-display">
                Register AI Agent
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2">
              <AgentForm
                form={registerForm}
                onChange={setRegisterForm}
                idPrefix="register"
              />
            </div>
            <Button
              className="w-full mt-2"
              data-ocid="agent.submit_button"
              onClick={handleRegister}
              disabled={
                submitting ||
                !registerForm.name.trim() ||
                !registerForm.description.trim() ||
                !registerForm.modelType.trim()
              }
            >
              {submitting ? "Registering..." : "Register Agent"}
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Template Section */}
      {(templatesLoading || templates.length > 0) && (
        <div className="space-y-3">
          {/* Section header */}
          <button
            type="button"
            className="flex items-center gap-2 group w-full text-left"
            data-ocid="agent_templates.toggle"
            onClick={() => setTemplateSectionOpen((v) => !v)}
          >
            <div className="p-1.5 rounded bg-primary/10">
              <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
            </div>
            <span className="font-display font-semibold text-sm">
              Start from a Template
            </span>
            {!templatesLoading && (
              <Badge variant="secondary" className="text-xs">
                {templates.length}{" "}
                {templates.length === 1 ? "template" : "templates"}
              </Badge>
            )}
            <div className="ml-auto text-muted-foreground group-hover:text-foreground transition-colors">
              {templateSectionOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          </button>

          {/* Template cards */}
          {templateSectionOpen && (
            <div className="flex gap-3 overflow-x-auto pb-2 flex-wrap md:flex-nowrap">
              {templatesLoading ? (
                <>
                  {[1, 2, 3].map((i) => (
                    <TemplateCardSkeleton key={i} />
                  ))}
                </>
              ) : (
                templates.map((tpl) => (
                  <Card
                    key={tpl.id}
                    className="border-border/60 min-w-[220px] max-w-[260px] shrink-0 hover:border-primary/40 transition-colors"
                  >
                    <CardContent className="p-4">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-2.5">
                        <div className="p-1.5 rounded-md bg-primary/10">
                          <LayoutTemplate className="w-3.5 h-3.5 text-primary" />
                        </div>
                        {tpl.isPublic ? (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-teal-500/10 text-teal-400 border-teal-500/30"
                          >
                            <Globe className="w-2 h-2 mr-0.5" />
                            Public
                          </Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="text-[10px] bg-muted text-muted-foreground"
                          >
                            <Lock className="w-2 h-2 mr-0.5" />
                            Private
                          </Badge>
                        )}
                      </div>

                      {/* Name */}
                      <p className="font-display font-semibold text-sm mb-1 line-clamp-1">
                        {tpl.name}
                      </p>

                      {/* Description */}
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {tpl.description}
                      </p>

                      {/* Endpoint indicator */}
                      {tpl.endpointUrl && (
                        <div className="flex items-center gap-1 text-[10px] text-teal-400 mb-2">
                          <Link className="w-2.5 h-2.5" />
                          <span className="truncate max-w-[140px] font-mono">
                            {tpl.endpointUrl}
                          </span>
                        </div>
                      )}

                      {/* Tags */}
                      {tpl.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {tpl.tags.slice(0, 3).map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {tag}
                            </Badge>
                          ))}
                          {tpl.tags.length > 3 && (
                            <span className="text-[10px] text-muted-foreground">
                              +{tpl.tags.length - 3}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Use Template button */}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full h-7 text-xs"
                        data-ocid="agent_templates.open_modal_button"
                        onClick={() => setCloneDialogTemplate(tpl)}
                        disabled={!orgId}
                      >
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      )}

      {/* Agent grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <AgentCardSkeleton key={i} />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <Card className="border-border/60" data-ocid="agent.empty_state">
          <CardContent className="py-16 text-center">
            <Bot className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No agents registered yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Register your first AI agent to start building your swarm.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent, idx) => (
            <Card
              key={agent.id}
              className="border-border/60"
              data-ocid={`agent.item.${idx + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Bot className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        STATUS_CONFIG[agent.status] ?? STATUS_CONFIG.inactive
                      }`}
                    >
                      <Activity className="w-2.5 h-2.5 mr-1" />
                      {agent.status}
                    </Badge>
                  </div>
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

                {agent.capabilities.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {agent.capabilities.map((cap) => (
                      <Badge key={cap} variant="secondary" className="text-xs">
                        {cap}
                      </Badge>
                    ))}
                  </div>
                )}

                {agent.supportedLanguages.length > 0 && (
                  <div className="flex items-center gap-1 flex-wrap mb-3">
                    {agent.supportedLanguages.map((lang) => (
                      <span
                        key={lang}
                        className="text-xs bg-muted/60 px-1.5 py-0.5 rounded text-muted-foreground"
                      >
                        {lang.toUpperCase()}
                      </span>
                    ))}
                  </div>
                )}

                {agent.endpointUrl && (
                  <p className="text-xs mb-3">
                    <span className="inline-flex items-center gap-1 bg-teal-500/10 text-teal-400 border border-teal-500/30 rounded px-1.5 py-0.5">
                      Endpoint configured
                    </span>
                  </p>
                )}

                <div className="flex gap-1.5 pt-2 border-t border-border/40">
                  {agent.status === AgentStatus.active && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                      data-ocid={`agent.open_modal_button.${idx + 1}`}
                      onClick={() => setChatTarget(agent)}
                    >
                      <MessageSquare className="w-3.5 h-3.5 mr-1" />
                      Test Chat
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    data-ocid={`agent.edit_button.${idx + 1}`}
                    onClick={() => openEdit(agent)}
                  >
                    <Pencil className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                  {agent.status !== AgentStatus.inactive && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                      data-ocid={`agent.delete_button.${idx + 1}`}
                      onClick={() => setDeactivateTarget(agent)}
                    >
                      <PowerOff className="w-3.5 h-3.5 mr-1" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
