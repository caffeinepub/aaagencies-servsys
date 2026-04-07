import type { backendInterface as FullBackend } from "@/../src/backend.d";
import { PlanTierBadge } from "@/components/PlanTierBadge";
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
import { exportToCSV } from "@/lib/utils";
import { useActor, useInternetIdentity } from "@caffeineai/core-infrastructure";
import {
  useMutation,
  useQueries,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import {
  Bot,
  Building2,
  Download,
  GitBranch,
  Loader2,
  Plus,
  Shield,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";

const PLAN_TIERS = ["free", "starter", "professional", "enterprise"] as const;
type PlanTierKey = (typeof PLAN_TIERS)[number];

const TIER_MAP: Record<string, object> = {
  free: { free: null },
  starter: { starter: null },
  professional: { professional: null },
  enterprise: { enterprise: null },
};

function normalizeTier(raw: unknown): string {
  if (typeof raw === "object" && raw !== null) {
    return Object.keys(raw)[0];
  }
  return String(raw);
}

// ─── OrgRow ──────────────────────────────────────────────────────────────────

interface OrgRowProps {
  org: {
    id: string;
    name: string;
    description: string;
    isActive: boolean;
    planTier: unknown;
    customDomain?: string;
    customSubdomain?: string;
  };
  userCount: number | null;
  agentCount: number | null;
  branchCount: number | null;
  index: number;
  onToggleActive: (orgId: string, newState: boolean) => void;
  onChangePlan: (orgId: string, currentTier: string) => void;
  isToggling: boolean;
}

function OrgRow({
  org,
  userCount,
  agentCount,
  branchCount,
  index,
  onToggleActive,
  onChangePlan,
  isToggling,
}: OrgRowProps) {
  const planTier = normalizeTier(org.planTier);

  return (
    <div
      className="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-4 hover:bg-muted/20 transition-colors"
      data-ocid={`orgs.item.${index}`}
    >
      {/* Left: identity */}
      <div className="flex items-start gap-3 flex-1 min-w-0">
        <div className="mt-0.5 p-1.5 rounded-md bg-muted/30 shrink-0">
          <Building2 className="w-4 h-4 text-muted-foreground" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium leading-tight">{org.name}</p>
          <p className="text-xs text-muted-foreground truncate mt-0.5 max-w-xs">
            {org.description || <span className="italic">No description</span>}
          </p>
          {(org.customDomain || org.customSubdomain) && (
            <p className="text-xs text-blue-400/80 mt-0.5 truncate">
              {org.customSubdomain
                ? `${org.customSubdomain}.aaa.io`
                : org.customDomain}
            </p>
          )}
        </div>
      </div>

      {/* Middle: resource counts */}
      <div className="flex items-center gap-3 shrink-0 pl-9 sm:pl-0">
        <ResourceCount
          icon={<Users className="w-3 h-3" />}
          value={userCount}
          label="users"
        />
        <ResourceCount
          icon={<Bot className="w-3 h-3" />}
          value={agentCount}
          label="agents"
        />
        <ResourceCount
          icon={<GitBranch className="w-3 h-3" />}
          value={branchCount}
          label="branches"
        />
      </div>

      {/* Right: badges + actions */}
      <div className="flex items-center gap-2 shrink-0 pl-9 sm:pl-0 flex-wrap">
        <PlanTierBadge tier={planTier} />

        {org.isActive ? (
          <Badge
            variant="outline"
            className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30"
          >
            Active
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-xs bg-rose-500/10 text-rose-400 border-rose-500/30"
          >
            Inactive
          </Badge>
        )}

        <Button
          size="sm"
          variant="outline"
          className="h-6 text-xs px-2 shrink-0"
          onClick={() => onChangePlan(org.id, planTier)}
          data-ocid={`orgs.edit_button.${index}`}
        >
          <Shield className="w-3 h-3 mr-1" />
          Change Plan
        </Button>

        <Button
          size="sm"
          variant={org.isActive ? "destructive" : "outline"}
          className="h-6 text-xs px-2 shrink-0"
          onClick={() => onToggleActive(org.id, !org.isActive)}
          disabled={isToggling}
          data-ocid={`orgs.toggle.${index}`}
        >
          {isToggling ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : org.isActive ? (
            "Deactivate"
          ) : (
            "Activate"
          )}
        </Button>
      </div>
    </div>
  );
}

function ResourceCount({
  icon,
  value,
  label,
}: { icon: React.ReactNode; value: number | null; label: string }) {
  return (
    <div className="flex items-center gap-1 text-xs text-muted-foreground">
      {icon}
      <span className="tabular-nums">
        {value === null ? (
          <span className="text-muted-foreground/40">—</span>
        ) : (
          value
        )}
      </span>
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function Organizations() {
  const { actor: _actor } = useActor(createActor);
  const actor = _actor as unknown as FullBackend | null;
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  // Create org dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    planTier: "starter",
    primaryLanguage: "en",
  });

  // Activate/Deactivate confirmation
  const [toggleTarget, setToggleTarget] = useState<{
    orgId: string;
    name: string;
    newState: boolean;
  } | null>(null);

  // Plan override dialog
  const [planTarget, setPlanTarget] = useState<{
    orgId: string;
    name: string;
    currentTier: string;
  } | null>(null);
  const [selectedTier, setSelectedTier] = useState("starter");
  const [planDialogOpen, setPlanDialogOpen] = useState(false);

  // ── Queries ──────────────────────────────────────────────────────────────

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["all-orgs"],
    queryFn: () => (actor as unknown as FullBackend).getAllOrganizations(),
    enabled: !!actor,
  });

  // Batch fetch user counts per org
  const userQueries = useQueries({
    queries: (orgs ?? []).map((org) => ({
      queryKey: ["org-users", org.id],
      queryFn: async () => {
        const result = await (
          actor as unknown as FullBackend
        ).getTeamMembersByOrg(org.id);
        return { orgId: org.id, count: result.length };
      },
      enabled: !!actor && !!orgs,
      staleTime: 60_000,
    })),
  });

  // Batch fetch agent counts per org
  const agentQueries = useQueries({
    queries: (orgs ?? []).map((org) => ({
      queryKey: ["org-agents", org.id],
      queryFn: async () => {
        const result = await (actor as unknown as FullBackend).getAgentsByOrg(
          org.id,
        );
        const agents = result.__kind__ === "ok" ? result.ok : [];
        return { orgId: org.id, count: agents.length };
      },
      enabled: !!actor && !!orgs,
      staleTime: 60_000,
    })),
  });

  // Batch fetch branch counts per org
  const branchQueries = useQueries({
    queries: (orgs ?? []).map((org) => ({
      queryKey: ["org-branches", org.id],
      queryFn: async () => {
        const result = await (actor as unknown as FullBackend).getBranchesByOrg(
          org.id,
        );
        return { orgId: org.id, count: result.length };
      },
      enabled: !!actor && !!orgs,
      staleTime: 60_000,
    })),
  });

  // Build lookup maps
  const userCounts: Record<string, number> = {};
  for (const q of userQueries) {
    if (q.data) userCounts[q.data.orgId] = q.data.count;
  }
  const agentCounts: Record<string, number> = {};
  for (const q of agentQueries) {
    if (q.data) agentCounts[q.data.orgId] = q.data.count;
  }
  const branchCounts: Record<string, number> = {};
  for (const q of branchQueries) {
    if (q.data) branchCounts[q.data.orgId] = q.data.count;
  }

  // ── Mutations ─────────────────────────────────────────────────────────────

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error("Not authenticated");
      const result = await (actor as unknown as FullBackend).createOrganization(
        {
          ownerId: identity.getPrincipal(),
          name: form.name,
          description: form.description,
          planTier: TIER_MAP[form.planTier] as never,
          primaryLanguage: form.primaryLanguage,
        },
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Organization created");
      queryClient.invalidateQueries({ queryKey: ["all-orgs"] });
      setCreateOpen(false);
      setForm({
        name: "",
        description: "",
        planTier: "starter",
        primaryLanguage: "en",
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const toggleActiveMutation = useMutation({
    mutationFn: async ({
      orgId,
      newState,
    }: { orgId: string; newState: boolean }) => {
      const result = await (actor as unknown as FullBackend).setOrgActive(
        orgId,
        newState,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: (_, { newState }) => {
      toast.success(
        newState ? "Organization activated" : "Organization deactivated",
      );
      queryClient.invalidateQueries({ queryKey: ["all-orgs"] });
      setToggleTarget(null);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setToggleTarget(null);
    },
  });

  const planOverrideMutation = useMutation({
    mutationFn: async ({ orgId, tier }: { orgId: string; tier: string }) => {
      const result = await (actor as unknown as FullBackend).setOrgPlanOverride(
        orgId,
        TIER_MAP[tier] as never,
      );
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Plan updated");
      queryClient.invalidateQueries({ queryKey: ["all-orgs"] });
      setPlanDialogOpen(false);
      setPlanTarget(null);
    },
    onError: (err: Error) => toast.error(err.message),
  });

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleToggleActive(orgId: string, newState: boolean) {
    const org = orgs?.find((o) => o.id === orgId);
    if (!org) return;
    setToggleTarget({ orgId, name: org.name, newState });
  }

  function handleChangePlan(orgId: string, currentTier: string) {
    const org = orgs?.find((o) => o.id === orgId);
    if (!org) return;
    setPlanTarget({ orgId, name: org.name, currentTier });
    setSelectedTier(currentTier);
    setPlanDialogOpen(true);
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Organizations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage all tenant organizations — plans, status, and resource usage
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              exportToCSV(
                (orgs ?? []) as unknown as Record<string, unknown>[],
                "organizations",
                [
                  { key: "name", label: "Name" },
                  { key: "description", label: "Description" },
                  { key: "planTier", label: "Plan" },
                  { key: "isActive", label: "Active" },
                  { key: "customDomain", label: "Domain" },
                  { key: "customSubdomain", label: "Subdomain" },
                ],
              )
            }
            title="Export CSV"
            data-ocid="orgs.secondary_button"
          >
            <Download className="w-4 h-4" />
          </Button>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-ocid="orgs.open_modal_button">
                <Plus className="w-4 h-4 mr-1.5" /> New Organization
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="orgs.dialog">
              <DialogHeader>
                <DialogTitle className="font-display">
                  Create Organization
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-2">
                <div className="space-y-2">
                  <Label>Organization Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    placeholder="e.g. TechVentures Global"
                    data-ocid="orgs.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input
                    value={form.description}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, description: e.target.value }))
                    }
                    placeholder="Brief description"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Plan Tier</Label>
                  <Select
                    value={form.planTier}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, planTier: v }))
                    }
                  >
                    <SelectTrigger data-ocid="orgs.select">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PLAN_TIERS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Language</Label>
                  <Select
                    value={form.primaryLanguage}
                    onValueChange={(v) =>
                      setForm((f) => ({ ...f, primaryLanguage: v }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="zh">普通话</SelectItem>
                      <SelectItem value="ar">العربية</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="sw">Kiswahili</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button
                  className="w-full"
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !form.name}
                  data-ocid="orgs.submit_button"
                >
                  {createMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Organization"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Org count summary */}
      {!isLoading && orgs && orgs.length > 0 && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>
            {orgs.length} organization{orgs.length !== 1 ? "s" : ""} &middot;{" "}
            {orgs.filter((o) => o.isActive).length} active
          </span>
        </div>
      )}

      {/* Main list */}
      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3" data-ocid="orgs.loading_state">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-md" />
              ))}
            </div>
          ) : !orgs || orgs.length === 0 ? (
            <div className="py-16 text-center" data-ocid="orgs.empty_state">
              <Building2 className="w-9 h-9 text-muted-foreground/40 mx-auto mb-3" />
              <p className="text-sm font-medium text-muted-foreground">
                No organizations yet
              </p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Create the first tenant organization using the button above.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {orgs.map((org, index) => (
                <OrgRow
                  key={org.id}
                  org={org}
                  userCount={userCounts[org.id] ?? null}
                  agentCount={agentCounts[org.id] ?? null}
                  branchCount={branchCounts[org.id] ?? null}
                  index={index + 1}
                  onToggleActive={handleToggleActive}
                  onChangePlan={handleChangePlan}
                  isToggling={
                    toggleActiveMutation.isPending &&
                    toggleTarget?.orgId === org.id
                  }
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activate / Deactivate Confirmation */}
      <AlertDialog
        open={!!toggleTarget}
        onOpenChange={(open) => {
          if (!open) setToggleTarget(null);
        }}
      >
        <AlertDialogContent data-ocid="orgs.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              {toggleTarget?.newState ? "Activate" : "Deactivate"} Organization?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to{" "}
              {toggleTarget?.newState ? "activate" : "deactivate"}{" "}
              <span className="font-semibold text-foreground">
                {toggleTarget?.name}
              </span>
              ?{" "}
              {!toggleTarget?.newState &&
                "Members will lose access until it is reactivated."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="orgs.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (toggleTarget) {
                  toggleActiveMutation.mutate({
                    orgId: toggleTarget.orgId,
                    newState: toggleTarget.newState,
                  });
                }
              }}
              className={
                toggleTarget?.newState
                  ? "bg-teal-600 hover:bg-teal-700 text-white"
                  : "bg-destructive hover:bg-destructive/90 text-white"
              }
              data-ocid="orgs.confirm_button"
            >
              {toggleActiveMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              {toggleTarget?.newState ? "Activate" : "Deactivate"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Plan Override Dialog */}
      <Dialog
        open={planDialogOpen}
        onOpenChange={(open) => {
          setPlanDialogOpen(open);
          if (!open) setPlanTarget(null);
        }}
      >
        <DialogContent data-ocid="orgs.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Change Plan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            {planTarget && (
              <p className="text-sm text-muted-foreground">
                Update the plan tier for{" "}
                <span className="font-semibold text-foreground">
                  {planTarget.name}
                </span>
                .
              </p>
            )}
            <div className="space-y-2">
              <Label>New Plan Tier</Label>
              <Select
                value={selectedTier}
                onValueChange={(v: PlanTierKey) => setSelectedTier(v)}
              >
                <SelectTrigger data-ocid="orgs.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PLAN_TIERS.map((t) => (
                    <SelectItem key={t} value={t}>
                      <div className="flex items-center gap-2">
                        <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                        {t === planTarget?.currentTier && (
                          <span className="text-xs text-muted-foreground">
                            (current)
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setPlanDialogOpen(false);
                  setPlanTarget(null);
                }}
                data-ocid="orgs.cancel_button"
              >
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => {
                  if (planTarget) {
                    planOverrideMutation.mutate({
                      orgId: planTarget.orgId,
                      tier: selectedTier,
                    });
                  }
                }}
                disabled={
                  planOverrideMutation.isPending ||
                  selectedTier === planTarget?.currentTier
                }
                data-ocid="orgs.save_button"
              >
                {planOverrideMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Plan"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
