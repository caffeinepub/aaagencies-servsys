import type { backendInterface as FullBackend } from "@/../src/backend.d";
import type { Organization, PlanLimits } from "@/../src/backend.d";
import { PlanTier } from "@/../src/backend.d";
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQueries, useQuery } from "@tanstack/react-query";
import {
  AlertTriangle,
  ArrowUpCircle,
  Bot,
  Check,
  CreditCard,
  Crown,
  ExternalLink,
  GitBranch,
  Info,
  KeyRound,
  Loader2,
  Receipt,
  Shield,
  Sparkles,
  TrendingUp,
  Users,
  Wallet,
  X,
  Zap,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";

// ── Types ─────────────────────────────────────────────────────────────────────

type PlanId = "free" | "starter" | "professional" | "enterprise";

interface PlanFeature {
  text: string;
}

interface PlanConfig {
  id: PlanId;
  name: string;
  price: string;
  priceSub: string;
  staticFeatures: PlanFeature[];
  accentClass: string;
  glowClass?: string;
  recommended?: boolean;
  icon: React.ElementType;
}

// ── Plan Definitions (static fallbacks) ──────────────────────────────────────

const PLANS: PlanConfig[] = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    priceSub: "forever",
    icon: Shield,
    accentClass: "border-slate-600/50",
    staticFeatures: [
      { text: "5 team members" },
      { text: "2 branches" },
      { text: "1 AI agent" },
      { text: "2 API keys" },
      { text: "Community support" },
    ],
  },
  {
    id: "starter",
    name: "Starter",
    price: "$29",
    priceSub: "per month",
    icon: Zap,
    accentClass: "border-blue-500/40",
    staticFeatures: [
      { text: "20 team members" },
      { text: "5 branches" },
      { text: "5 AI agents" },
      { text: "10 API keys" },
      { text: "Email support" },
      { text: "API access" },
    ],
  },
  {
    id: "professional",
    name: "Professional",
    price: "$99",
    priceSub: "per month",
    icon: Sparkles,
    accentClass: "border-teal-500/60",
    glowClass:
      "shadow-[0_0_24px_rgba(20,184,166,0.18)] ring-1 ring-teal-500/30",
    recommended: true,
    staticFeatures: [
      { text: "100 team members" },
      { text: "20 branches" },
      { text: "20 AI agents" },
      { text: "50 API keys" },
      { text: "Priority support" },
      { text: "API access" },
      { text: "FinFracFran™ wallets" },
      { text: "Custom domain" },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    priceSub: "pricing",
    icon: Crown,
    accentClass: "border-amber-500/40",
    staticFeatures: [
      { text: "Unlimited team members" },
      { text: "Unlimited branches" },
      { text: "Unlimited AI agents" },
      { text: "Unlimited API keys" },
      { text: "Dedicated support" },
      { text: "SLA guarantee" },
      { text: "White-label ready" },
      { text: "Custom integrations" },
    ],
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function getPlanTierString(org: Organization): PlanId {
  if (typeof org.planTier === "object" && org.planTier !== null) {
    return (Object.keys(org.planTier as object)[0] as PlanId) ?? "free";
  }
  return String(org.planTier) as PlanId;
}

function formatLimitValue(val: number): string {
  return val >= 9999 ? "Unlimited" : String(val);
}

function buildPlanFeatures(limits: PlanLimits, planId: PlanId): PlanFeature[] {
  const base: PlanFeature[] = [
    { text: `${formatLimitValue(Number(limits.maxUsers))} team members` },
    { text: `${formatLimitValue(Number(limits.maxBranches))} branches` },
    { text: `${formatLimitValue(Number(limits.maxAgents))} AI agents` },
    { text: `${formatLimitValue(Number(limits.maxApiKeys))} API keys` },
    { text: `${formatLimitValue(Number(limits.maxWallets))} wallets` },
  ];
  const extras: Record<PlanId, PlanFeature[]> = {
    free: [{ text: "Community support" }],
    starter: [{ text: "Email support" }, { text: "API access" }],
    professional: [
      { text: "Priority support" },
      { text: "API access" },
      { text: "FinFracFran™ wallets" },
      { text: "Custom domain" },
    ],
    enterprise: [
      { text: "Dedicated support" },
      { text: "SLA guarantee" },
      { text: "White-label ready" },
      { text: "Custom integrations" },
    ],
  };
  return [...base, ...(extras[planId] ?? [])];
}

// ── Resource Usage Card ───────────────────────────────────────────────────────

interface ResourceRowProps {
  icon: React.ElementType;
  label: string;
  current: number | null;
  max: number;
  isLoading: boolean;
}

function ResourceRow({
  icon: Icon,
  label,
  current,
  max,
  isLoading,
}: ResourceRowProps) {
  const isUnlimited = max >= 9999;
  const pct =
    isUnlimited || current === null ? 0 : Math.min((current / max) * 100, 100);
  const isAtLimit = !isUnlimited && current !== null && current >= max;
  const isWarning = !isUnlimited && !isAtLimit && current !== null && pct >= 80;

  if (isLoading) {
    return (
      <div className="flex items-center gap-3 py-2">
        <Skeleton className="w-7 h-7 rounded-lg shrink-0" />
        <div className="flex-1 space-y-1.5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-2 w-full" />
        </div>
        <Skeleton className="h-3 w-12" />
      </div>
    );
  }

  const progressColorClass = isAtLimit
    ? "[&>div]:bg-destructive"
    : isWarning
      ? "[&>div]:bg-amber-500"
      : "";

  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={`shrink-0 p-1.5 rounded-lg ${
          isAtLimit
            ? "bg-destructive/15"
            : isWarning
              ? "bg-amber-500/15"
              : "bg-muted/50"
        }`}
      >
        <Icon
          className={`w-3.5 h-3.5 ${
            isAtLimit
              ? "text-destructive"
              : isWarning
                ? "text-amber-400"
                : "text-muted-foreground"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="text-xs font-medium truncate">{label}</span>
          <div className="flex items-center gap-2 shrink-0">
            {isWarning && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 bg-amber-500/10 text-amber-400 border-amber-500/30"
              >
                ⚠ 80% used
              </Badge>
            )}
            {isAtLimit && (
              <Badge
                variant="outline"
                className="text-[10px] px-1.5 py-0 bg-destructive/10 text-destructive border-destructive/30"
              >
                🔴 At limit
              </Badge>
            )}
            <span
              className={`text-xs tabular-nums ${
                isAtLimit
                  ? "text-destructive font-semibold"
                  : isWarning
                    ? "text-amber-400 font-medium"
                    : "text-muted-foreground"
              }`}
            >
              {current !== null ? current : "—"} / {isUnlimited ? "∞" : max}
            </span>
          </div>
        </div>

        {isUnlimited ? (
          <div className="flex items-center gap-1.5">
            <div className="flex-1 h-1.5 rounded-full bg-teal-500/20" />
            <span className="text-[10px] text-teal-400 font-medium">
              Unlimited
            </span>
          </div>
        ) : (
          <Progress value={pct} className={`h-1.5 ${progressColorClass}`} />
        )}
      </div>

      {isAtLimit && (
        <Button
          variant="destructive"
          size="sm"
          className="shrink-0 h-6 text-[10px] px-2"
          onClick={() =>
            document
              .getElementById("plan-grid")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          data-ocid="subscription.usage.upgrade_button"
        >
          Upgrade →
        </Button>
      )}
    </div>
  );
}

interface ResourceUsageCardProps {
  org: Organization;
  fullActor: FullBackend | null;
  isFetching: boolean;
}

function ResourceUsageCard({
  org,
  fullActor,
  isFetching,
}: ResourceUsageCardProps) {
  const enabled = !!fullActor && !isFetching && !!org;

  const currentTierStr = getPlanTierString(org);
  const tierEnumValue =
    (PlanTier[currentTierStr as keyof typeof PlanTier] as PlanTier) ??
    PlanTier.free;

  const { data: planLimits, isLoading: limitsLoading } = useQuery<PlanLimits>({
    queryKey: ["plan-limits", currentTierStr],
    queryFn: () => fullActor!.getPlanLimits(tierEnumValue),
    enabled,
  });

  const resourceQueries = useQueries({
    queries: [
      {
        queryKey: ["org-users", org.id],
        queryFn: async () => {
          const res = await fullActor!.getTeamMembersByOrg(org.id);
          return res.length;
        },
        enabled,
      },
      {
        queryKey: ["org-branches", org.id],
        queryFn: async () => {
          const res = await fullActor!.getBranchesByOrg(org.id);
          return res.length;
        },
        enabled,
      },
      {
        queryKey: ["org-agents", org.id],
        queryFn: async () => {
          const res = await fullActor!.getAgentsByOrg(org.id);
          if (res.__kind__ === "ok") return res.ok.length;
          return 0;
        },
        enabled,
      },
      {
        queryKey: ["org-apikeys"],
        queryFn: async () => {
          const res = await fullActor!.listApiKeys();
          if (res.__kind__ === "ok")
            return res.ok.filter((k) => k.isActive).length;
          return 0;
        },
        enabled,
      },
      {
        queryKey: ["org-wallets", org.id],
        queryFn: async () => {
          const res = await fullActor!.getWalletsByOrg(org.id);
          if (res.__kind__ === "ok") return res.ok.length;
          return 0;
        },
        enabled,
      },
    ],
  });

  const [usersQ, branchesQ, agentsQ, apiKeysQ, walletsQ] = resourceQueries;

  const defaultLimits: PlanLimits = {
    maxUsers: 5n,
    maxBranches: 2n,
    maxAgents: 1n,
    maxApiKeys: 2n,
    maxWallets: 2n,
  };
  const limits = planLimits ?? defaultLimits;
  const anyLoading = limitsLoading || resourceQueries.some((q) => q.isLoading);

  const resources = [
    {
      icon: Users,
      label: "Team Members",
      current: usersQ.data ?? null,
      max: Number(limits.maxUsers),
      isLoading: usersQ.isLoading || limitsLoading,
    },
    {
      icon: GitBranch,
      label: "Branches",
      current: branchesQ.data ?? null,
      max: Number(limits.maxBranches),
      isLoading: branchesQ.isLoading || limitsLoading,
    },
    {
      icon: Bot,
      label: "AI Agents",
      current: agentsQ.data ?? null,
      max: Number(limits.maxAgents),
      isLoading: agentsQ.isLoading || limitsLoading,
    },
    {
      icon: KeyRound,
      label: "API Keys (Active)",
      current: apiKeysQ.data ?? null,
      max: Number(limits.maxApiKeys),
      isLoading: apiKeysQ.isLoading || limitsLoading,
    },
    {
      icon: Wallet,
      label: "Wallets",
      current: walletsQ.data ?? null,
      max: Number(limits.maxWallets),
      isLoading: walletsQ.isLoading || limitsLoading,
    },
  ];

  return (
    <Card className="border-border/60" data-ocid="subscription.usage.card">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-primary" />
          Resource Usage
          {anyLoading && (
            <Loader2 className="w-3.5 h-3.5 text-muted-foreground animate-spin ml-1" />
          )}
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Live usage against your{" "}
          <span className="capitalize font-medium text-foreground">
            {currentTierStr}
          </span>{" "}
          plan limits
        </p>
      </CardHeader>
      <CardContent className="divide-y divide-border/50">
        {resources.map((r) => (
          <ResourceRow
            key={r.label}
            icon={r.icon}
            label={r.label}
            current={r.current}
            max={r.max}
            isLoading={r.isLoading}
          />
        ))}
      </CardContent>
    </Card>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function ConfigBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div className="relative rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3.5 flex items-start gap-3">
      <div className="shrink-0 mt-0.5 p-1.5 rounded-md bg-amber-500/15">
        <AlertTriangle className="w-4 h-4 text-amber-400" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="font-display font-semibold text-sm text-amber-300">
            Stripe Integration Pending
          </p>
          <Badge
            variant="outline"
            className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30 px-1.5 py-0"
          >
            Keys pending
          </Badge>
        </div>
        <p className="text-xs text-amber-200/70 mt-1 leading-relaxed">
          Your subscription UI is fully wired and ready. Once Stripe API keys
          are configured in the platform environment, all upgrade, downgrade,
          and billing actions will activate automatically.
        </p>
      </div>
      <button
        type="button"
        onClick={onDismiss}
        data-ocid="subscription.dismiss_banner_button"
        className="shrink-0 mt-0.5 text-amber-400/60 hover:text-amber-300 transition-colors"
        aria-label="Dismiss banner"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function CurrentPlanCard({ org }: { org: Organization }) {
  const stripeConnected = !!org.stripeCustomerId;
  const hasSubscription = !!org.stripeSubscriptionId;
  const planTier = getPlanTierString(org);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          Current Plan
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <PlanTierBadge tier={planTier} />
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Badge
                        variant="outline"
                        className={`text-xs cursor-default ${
                          hasSubscription
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                            : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        }`}
                      >
                        {hasSubscription ? "Active" : "Active (Demo)"}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="max-w-xs text-xs">
                      {hasSubscription
                        ? "Your subscription is active via Stripe."
                        : "Demo mode — no active Stripe subscription yet. UI is fully ready for Stripe activation."}
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                <span>Billing: Monthly</span>
                <span className="text-border">•</span>
                <TooltipProvider delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="flex items-center gap-1 cursor-default">
                        Next renewal: —
                        <Info className="w-3 h-3" />
                      </span>
                    </TooltipTrigger>
                    <TooltipContent side="right" className="text-xs">
                      Available once Stripe is connected
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!stripeConnected}
                    className="gap-1.5 whitespace-nowrap"
                    data-ocid="subscription.manage_billing_button"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Manage Billing
                  </Button>
                </span>
              </TooltipTrigger>
              {!stripeConnected && (
                <TooltipContent side="left" className="text-xs">
                  Configure Stripe keys to enable
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

interface PlanCardProps {
  plan: PlanConfig;
  currentTier: PlanId;
  stripeConfigured: boolean;
  onUpgrade: (planId: PlanId) => void;
  resolvedLimits?: PlanLimits;
}

function PlanCard({
  plan,
  currentTier,
  stripeConfigured,
  onUpgrade,
  resolvedLimits,
}: PlanCardProps) {
  const isCurrent = plan.id === currentTier;

  const tierOrder: PlanId[] = ["free", "starter", "professional", "enterprise"];
  const currentIdx = tierOrder.indexOf(currentTier);
  const planIdx = tierOrder.indexOf(plan.id);
  const isUpgrade = planIdx > currentIdx;
  const isDowngrade = planIdx < currentIdx;

  const ctaLabel = isCurrent
    ? "Current Plan"
    : isUpgrade
      ? "Upgrade"
      : isDowngrade
        ? "Downgrade"
        : "Select Plan";

  const Icon = plan.icon;

  const displayFeatures = resolvedLimits
    ? buildPlanFeatures(resolvedLimits, plan.id)
    : plan.staticFeatures;

  const accentIconColor: Record<PlanId, string> = {
    free: "text-slate-400",
    starter: "text-blue-400",
    professional: "text-teal-400",
    enterprise: "text-amber-400",
  };

  const accentTextColor: Record<PlanId, string> = {
    free: "text-slate-400",
    starter: "text-blue-400",
    professional: "text-teal-300",
    enterprise: "text-amber-400",
  };

  const accentBgColor: Record<PlanId, string> = {
    free: "bg-slate-500/10",
    starter: "bg-blue-500/10",
    professional: "bg-teal-500/10",
    enterprise: "bg-amber-500/10",
  };

  return (
    <div
      className={`relative flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 ${
        plan.accentClass
      } ${plan.glowClass ?? ""} ${
        isCurrent ? "opacity-75" : "hover:border-opacity-80"
      }`}
    >
      {/* Recommended badge */}
      {plan.recommended && (
        <div className="absolute -top-3 right-4">
          <Badge className="text-xs bg-teal-500/20 text-teal-300 border border-teal-500/40 px-2 py-0.5">
            ✦ Recommended
          </Badge>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className={`p-2 rounded-lg ${accentBgColor[plan.id]}`}>
          <Icon className={`w-4 h-4 ${accentIconColor[plan.id]}`} />
        </div>
        <div>
          <h3 className="font-display font-bold text-sm">{plan.name}</h3>
          <p className={`text-xs ${accentTextColor[plan.id]}`}>
            {plan.price === "Custom" ? "" : plan.price}{" "}
            <span className="text-muted-foreground">{plan.priceSub}</span>
          </p>
        </div>
        {plan.price !== "Custom" && (
          <p
            className={`ml-auto font-display font-bold text-xl ${accentTextColor[plan.id]}`}
          >
            {plan.price}
          </p>
        )}
      </div>

      {/* Features */}
      <ul className="space-y-1.5 flex-1 mb-5">
        {displayFeatures.map((feat) => (
          <li key={feat.text} className="flex items-start gap-2 text-xs">
            <Check
              className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${accentIconColor[plan.id]}`}
            />
            <span className="text-muted-foreground">{feat.text}</span>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <TooltipProvider delayDuration={300}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="w-full">
              <Button
                variant={isCurrent ? "outline" : "default"}
                size="sm"
                className="w-full gap-1.5"
                disabled={isCurrent || !stripeConfigured}
                onClick={() => !isCurrent && onUpgrade(plan.id)}
                data-ocid="subscription.upgrade_plan_button"
              >
                {!isCurrent && isUpgrade && (
                  <ArrowUpCircle className="w-3.5 h-3.5" />
                )}
                {ctaLabel}
              </Button>
            </span>
          </TooltipTrigger>
          {!isCurrent && !stripeConfigured && (
            <TooltipContent side="bottom" className="text-xs">
              Stripe keys required to change plans
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

function BillingHistoryCard({ stripeConnected }: { stripeConnected: boolean }) {
  return (
    <Card className="border-border/60">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Receipt className="w-4 h-4 text-primary" />
          Billing History
        </CardTitle>
      </CardHeader>
      <CardContent>
        {stripeConnected ? (
          <Table>
            <TableHeader>
              <TableRow className="border-border/60">
                <TableHead className="text-xs">Date</TableHead>
                <TableHead className="text-xs">Description</TableHead>
                <TableHead className="text-xs">Amount</TableHead>
                <TableHead className="text-xs">Status</TableHead>
                <TableHead className="text-xs">Invoice</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="text-center py-10 text-muted-foreground text-sm"
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-3 rounded-xl bg-muted/30">
                      <Receipt className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground text-sm">
                        No invoices yet
                      </p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Invoices will appear here after your first billing
                        cycle.
                      </p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        ) : (
          <div
            className="flex flex-col items-center justify-center py-10 gap-3"
            data-ocid="subscription.billing_history.empty_state"
          >
            <div className="p-4 rounded-2xl bg-muted/30">
              <Receipt className="w-7 h-7 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-sm">
                Connect Stripe to view invoices
              </p>
              <p className="text-xs text-muted-foreground mt-1 max-w-sm">
                Billing history will appear here once your Stripe integration is
                active.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CancelSubscriptionCard({
  hasSubscription,
  onCancel,
  cancelling,
}: {
  hasSubscription: boolean;
  onCancel: () => Promise<void>;
  cancelling: boolean;
}) {
  return (
    <Card className="border-destructive/30 bg-destructive/5">
      <CardContent className="p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-destructive">
              Cancel Subscription
            </h3>
            <p className="text-xs text-muted-foreground mt-1 max-w-sm">
              Cancelling will downgrade your organization to the Free plan at
              the end of your current billing period.
            </p>
          </div>
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>
                <span>
                  {hasSubscription ? (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          className="whitespace-nowrap"
                          data-ocid="subscription.cancel_button"
                        >
                          Cancel Subscription
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent data-ocid="subscription.cancel.dialog">
                        <AlertDialogHeader>
                          <AlertDialogTitle className="font-display">
                            Cancel your subscription?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will schedule your subscription for
                            cancellation at the end of the current billing
                            period. You'll retain access until then, then be
                            downgraded to the Free plan.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="subscription.cancel.cancel_button">
                            Keep Subscription
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={onCancel}
                            disabled={cancelling}
                            className="bg-destructive hover:bg-destructive/90"
                            data-ocid="subscription.cancel.confirm_button"
                          >
                            {cancelling && (
                              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                            )}
                            {cancelling ? "Cancelling…" : "Yes, Cancel"}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  ) : (
                    <Button
                      variant="destructive"
                      size="sm"
                      disabled
                      className="whitespace-nowrap"
                      data-ocid="subscription.cancel_button"
                    >
                      Cancel Subscription
                    </Button>
                  )}
                </span>
              </TooltipTrigger>
              {!hasSubscription && (
                <TooltipContent side="left" className="text-xs">
                  No active subscription to cancel
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function SubscriptionBilling() {
  const { actor: _actor, isFetching } = useActor(createActor);
  const actor = _actor as unknown as FullBackend | null;
  const [bannerDismissed, setBannerDismissed] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const {
    data: org,
    isLoading,
    isError,
  } = useQuery<Organization | null>({
    queryKey: ["myOrganization"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getMyOrganization();
    },
    enabled: !!actor && !isFetching,
  });

  // Fetch all 4 tiers' limits in parallel for plan cards
  const tierKeys = ["free", "starter", "professional", "enterprise"] as const;
  const planLimitsQueries = useQueries({
    queries: tierKeys.map((tier) => ({
      queryKey: ["plan-limits", tier],
      queryFn: () => actor!.getPlanLimits(tier as PlanTier),
      enabled: !!actor && !isFetching,
    })),
  });

  const planLimitsMap = tierKeys.reduce(
    (acc, tier, idx) => {
      acc[tier] = planLimitsQueries[idx].data ?? null;
      return acc;
    },
    {} as Record<string, PlanLimits | null>,
  );

  const stripeConfigured = !!org?.stripeCustomerId;
  const hasSubscription = !!org?.stripeSubscriptionId;
  const currentTier: PlanId = org ? getPlanTierString(org) : "free";

  const showBanner = !bannerDismissed && !stripeConfigured;

  async function handleUpgrade(planId: PlanId) {
    if (!actor || !stripeConfigured) return;
    try {
      await (
        actor as unknown as {
          createCheckoutSession: (
            planId: string,
          ) => Promise<{ __kind__: string; ok?: string }>;
        }
      ).createCheckoutSession(planId);
      toast.success("Redirecting to Stripe checkout…");
    } catch {
      toast.error("Failed to start checkout session");
    }
  }

  async function handleCancel() {
    if (!actor) return;
    setCancelling(true);
    try {
      await (
        actor as unknown as {
          cancelSubscription: () => Promise<{ __kind__: string }>;
        }
      ).cancelSubscription();
      toast.success("Subscription cancellation scheduled.");
    } catch {
      toast.error("Failed to cancel subscription");
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-display font-semibold">
          Subscription & Billing
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your plan, upgrades, and payment history
        </p>
      </div>

      {/* A. Configuration Notice Banner */}
      {showBanner && (
        <ConfigBanner onDismiss={() => setBannerDismissed(true)} />
      )}

      {/* Loading state */}
      {isLoading && (
        <Card
          className="border-border/60"
          data-ocid="subscription.loading_state"
        >
          <CardContent className="p-5">
            <div className="flex items-center gap-4">
              <Skeleton className="w-11 h-11 rounded-xl" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-3 w-56" />
              </div>
              <Skeleton className="h-8 w-32" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {isError && (
        <Card
          className="border-destructive/30 bg-destructive/5"
          data-ocid="subscription.error_state"
        >
          <CardContent className="p-4">
            <p className="text-sm text-destructive">
              Failed to load organization data. Please refresh and try again.
            </p>
          </CardContent>
        </Card>
      )}

      {/* B. Current Plan Card */}
      {!isLoading && org && <CurrentPlanCard org={org} />}

      {/* C. Resource Usage Card */}
      {!isLoading && org && (
        <ResourceUsageCard
          org={org}
          fullActor={actor}
          isFetching={isFetching}
        />
      )}

      {/* D. Plan Comparison Grid */}
      {!isLoading && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <h2 className="font-display font-semibold text-base">
              Choose Your Plan
            </h2>
            {!stripeConfigured && (
              <Badge
                variant="outline"
                className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30"
              >
                Preview mode
              </Badge>
            )}
          </div>
          <div
            id="plan-grid"
            className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
          >
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                currentTier={currentTier}
                stripeConfigured={stripeConfigured}
                onUpgrade={handleUpgrade}
                resolvedLimits={planLimitsMap[plan.id] ?? undefined}
              />
            ))}
          </div>
        </div>
      )}

      {/* E. Billing History Table */}
      {!isLoading && <BillingHistoryCard stripeConnected={stripeConfigured} />}

      {/* F. Cancel Subscription */}
      {!isLoading && (
        <CancelSubscriptionCard
          hasSubscription={hasSubscription}
          onCancel={handleCancel}
          cancelling={cancelling}
        />
      )}
    </div>
  );
}
