import type { backendInterface as FullBackend } from "@/../src/backend.d";
import type { PlanLimits, PlanTier } from "@/../src/backend.d";
import { PlanTierBadge } from "@/components/PlanTierBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import {
  AlertCircle,
  BadgeDollarSign,
  Loader2,
  Save,
  SlidersHorizontal,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const TIER_KEYS: PlanTier[] = [
  "free",
  "starter",
  "professional",
  "enterprise",
] as PlanTier[];

const PLAN_PRICING: Record<string, { monthly: number; label: string }> = {
  free: { monthly: 0, label: "Free" },
  starter: { monthly: 29, label: "Starter" },
  professional: { monthly: 99, label: "Professional" },
  enterprise: { monthly: 149, label: "Enterprise (est.)" },
};

type OrgsByPlan = {
  free: number;
  starter: number;
  professional: number;
  enterprise: number;
};

function formatMRR(value: number) {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(1)}k`;
  }
  return `$${value.toLocaleString()}`;
}

export default function PlatformBilling() {
  const { actor: _actor } = useActor();
  const actor = _actor as unknown as FullBackend | null;

  // ── Revenue Overview ────────────────────────────────────────────────────────
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["platform-metrics"],
    queryFn: async () => {
      const result = await actor!.getPlatformMetrics();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor,
  });

  // ── Plan Limits ─────────────────────────────────────────────────────────────
  const { data: freeLimits, isLoading: freeLoading } = useQuery({
    queryKey: ["plan-limits", "free"],
    queryFn: () => actor!.getPlanLimits("free" as PlanTier),
    enabled: !!actor,
  });
  const { data: starterLimits, isLoading: starterLoading } = useQuery({
    queryKey: ["plan-limits", "starter"],
    queryFn: () => actor!.getPlanLimits("starter" as PlanTier),
    enabled: !!actor,
  });
  const { data: professionalLimits, isLoading: professionalLoading } = useQuery(
    {
      queryKey: ["plan-limits", "professional"],
      queryFn: () => actor!.getPlanLimits("professional" as PlanTier),
      enabled: !!actor,
    },
  );
  const { data: enterpriseLimits, isLoading: enterpriseLoading } = useQuery({
    queryKey: ["plan-limits", "enterprise"],
    queryFn: () => actor!.getPlanLimits("enterprise" as PlanTier),
    enabled: !!actor,
  });

  const limitsLoading =
    freeLoading || starterLoading || professionalLoading || enterpriseLoading;

  const limitsByTier: Record<string, PlanLimits | undefined> = {
    free: freeLimits,
    starter: starterLimits,
    professional: professionalLimits,
    enterprise: enterpriseLimits,
  };

  // Local edits state — keyed by tier
  const [localEdits, setLocalEdits] = useState<Record<string, PlanLimits>>({});
  const [savingTier, setSavingTier] = useState<string | null>(null);

  // Get the current display value for a tier (local edit takes precedence)
  function getLimitValue(tier: string, field: keyof PlanLimits): number {
    const local = localEdits[tier];
    if (local !== undefined) return local[field];
    const fetched = limitsByTier[tier];
    if (fetched !== undefined) return fetched[field];
    return 0;
  }

  function handleEditField(
    tier: string,
    field: keyof PlanLimits,
    rawValue: string,
  ) {
    const parsed = Number.parseInt(rawValue, 10);
    const value = Number.isNaN(parsed) ? 0 : Math.max(0, parsed);
    const current: PlanLimits = localEdits[tier] ??
      limitsByTier[tier] ?? {
        maxUsers: 0,
        maxBranches: 0,
        maxAgents: 0,
        maxApiKeys: 0,
        maxWallets: 0,
      };
    setLocalEdits((prev) => ({
      ...prev,
      [tier]: { ...current, [field]: value },
    }));
  }

  async function handleSaveTier(tier: string) {
    if (!actor) return;
    const edits = localEdits[tier] ??
      limitsByTier[tier] ?? {
        maxUsers: 0,
        maxBranches: 0,
        maxAgents: 0,
        maxApiKeys: 0,
        maxWallets: 0,
      };
    setSavingTier(tier);
    try {
      const result = await actor.setPlanLimits(tier as PlanTier, edits);
      if (result.__kind__ === "err") {
        toast.error(`Failed to save ${tier} limits: ${result.err}`);
      } else {
        toast.success(
          `${PLAN_PRICING[tier]?.label ?? tier} plan limits saved.`,
        );
        // Clear local edits so it re-reads from the server on next load
        setLocalEdits((prev) => {
          const next = { ...prev };
          delete next[tier];
          return next;
        });
      }
    } catch (_e) {
      toast.error("Unexpected error saving limits.");
    } finally {
      setSavingTier(null);
    }
  }

  // ── MRR Calculation ─────────────────────────────────────────────────────────
  const orgsByPlan = metrics?.orgsByPlan as OrgsByPlan | undefined;

  const mrrRows = TIER_KEYS.map((tier) => {
    const count = orgsByPlan?.[tier as keyof OrgsByPlan] ?? 0;
    const pricing = PLAN_PRICING[tier];
    const mrr = count * (pricing?.monthly ?? 0);
    return { tier, count, monthly: pricing?.monthly ?? 0, mrr };
  });

  const totalMRR = mrrRows
    .filter((r) => r.tier !== "free")
    .reduce((sum, r) => sum + r.mrr, 0);

  const limitFields: Array<{ key: keyof PlanLimits; label: string }> = [
    { key: "maxUsers", label: "Max Users" },
    { key: "maxBranches", label: "Max Branches" },
    { key: "maxAgents", label: "Max Agents" },
    { key: "maxApiKeys", label: "Max API Keys" },
    { key: "maxWallets", label: "Max Wallets" },
  ];

  return (
    <div className="space-y-8" data-ocid="platform_billing.page">
      {/* ── Header ── */}
      <div>
        <h1 className="text-2xl font-display font-semibold">
          Platform Billing
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Revenue overview and plan limit configuration for all tenant tiers
        </p>
      </div>

      {/* ── Section A: Revenue Overview ── */}
      <Card
        className="border-border/60"
        data-ocid="platform_billing.revenue.card"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div>
              <CardTitle className="text-base font-display">
                Revenue Overview
              </CardTitle>
              <CardDescription className="text-xs">
                Estimated MRR based on active org counts per plan tier
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {metricsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60">
                    <TableHead className="text-xs">Plan Tier</TableHead>
                    <TableHead className="text-xs text-right">Orgs</TableHead>
                    <TableHead className="text-xs text-right">
                      Monthly Rate
                    </TableHead>
                    <TableHead className="text-xs text-right">
                      Est. MRR
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mrrRows.map(({ tier, count, monthly, mrr }) => (
                    <TableRow key={tier} className="border-border/40">
                      <TableCell>
                        <PlanTierBadge tier={tier} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm">
                        {count}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm text-muted-foreground">
                        {monthly === 0 ? "—" : `$${monthly}/mo`}
                      </TableCell>
                      <TableCell className="text-right tabular-nums text-sm font-medium">
                        {monthly === 0 ? (
                          <span className="text-muted-foreground">—</span>
                        ) : (
                          <span
                            className={
                              mrr > 0
                                ? "text-emerald-400"
                                : "text-muted-foreground"
                            }
                          >
                            {formatMRR(mrr)}
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {/* Total row */}
                  <TableRow className="border-t border-border/60 bg-muted/20">
                    <TableCell
                      colSpan={3}
                      className="font-display font-semibold text-sm"
                    >
                      <div className="flex items-center gap-1.5">
                        <BadgeDollarSign className="w-4 h-4 text-emerald-400" />
                        Total Est. MRR
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-emerald-400 font-display font-bold text-base tabular-nums">
                        {formatMRR(totalMRR)}
                      </span>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>

              {/* Amber disclaimer */}
              <div className="flex items-start gap-2.5 rounded-lg border border-amber-500/40 bg-amber-500/5 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-200/70 leading-relaxed">
                  Estimated figures based on org counts × plan pricing. Actual
                  revenue depends on Stripe invoices. Connect Stripe to see live
                  billing data.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* ── Section B: Plan Limit Configuration ── */}
      <Card
        className="border-border/60"
        data-ocid="platform_billing.limits.card"
      >
        <CardHeader className="pb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
              <SlidersHorizontal className="w-4 h-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base font-display">
                Plan Limit Configuration
              </CardTitle>
              <CardDescription className="text-xs">
                Set resource limits per plan tier. Changes apply to all orgs on
                that tier.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {limitsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-border/60">
                      <TableHead className="text-xs w-[130px]">Plan</TableHead>
                      {limitFields.map((f) => (
                        <TableHead key={f.key} className="text-xs text-center">
                          {f.label}
                        </TableHead>
                      ))}
                      <TableHead className="text-xs w-[90px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {TIER_KEYS.map((tier) => (
                      <TableRow key={tier} className="border-border/40">
                        <TableCell>
                          <PlanTierBadge tier={tier} />
                        </TableCell>
                        {limitFields.map((f) => (
                          <TableCell key={f.key} className="text-center py-2">
                            <Input
                              type="number"
                              min={0}
                              value={getLimitValue(tier, f.key)}
                              onChange={(e) =>
                                handleEditField(tier, f.key, e.target.value)
                              }
                              placeholder={tier === "enterprise" ? "∞" : "0"}
                              className="h-8 w-20 text-center text-sm mx-auto tabular-nums"
                              id={`mobile-${tier}-${f.key}`}
                              data-ocid={`platform_billing.${tier}.${f.key}.input`}
                            />
                          </TableCell>
                        ))}
                        <TableCell className="text-right py-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 gap-1.5 text-xs"
                            disabled={savingTier === tier}
                            onClick={() => handleSaveTier(tier)}
                            data-ocid={`platform_billing.${tier}.save_button`}
                          >
                            {savingTier === tier ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            {savingTier === tier ? "Saving" : "Save"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile stacked cards */}
              <div className="md:hidden space-y-4">
                {TIER_KEYS.map((tier) => (
                  <div
                    key={tier}
                    className="rounded-lg border border-border/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <PlanTierBadge tier={tier} />
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 gap-1.5 text-xs"
                        disabled={savingTier === tier}
                        onClick={() => handleSaveTier(tier)}
                        data-ocid={`platform_billing.${tier}.save_button`}
                      >
                        {savingTier === tier ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Save className="w-3 h-3" />
                        )}
                        {savingTier === tier ? "Saving" : "Save"}
                      </Button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {limitFields.map((f) => (
                        <div key={f.key} className="space-y-1">
                          <label
                            htmlFor={`mobile-${tier}-${f.key}`}
                            className="text-xs text-muted-foreground"
                          >
                            {f.label}
                          </label>
                          <Input
                            type="number"
                            min={0}
                            value={getLimitValue(tier, f.key)}
                            onChange={(e) =>
                              handleEditField(tier, f.key, e.target.value)
                            }
                            placeholder={tier === "enterprise" ? "∞" : "0"}
                            className="h-8 text-sm tabular-nums"
                            id={`mobile-${tier}-${f.key}`}
                            data-ocid={`platform_billing.${tier}.${f.key}.input`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Helper note */}
              <div className="flex items-start gap-2.5 rounded-lg border border-border/40 bg-muted/20 px-4 py-3">
                <AlertCircle className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Enterprise limits set to{" "}
                  <span className="font-mono text-foreground/60">0</span> are
                  treated as unlimited by the backend. Org Admins can further
                  restrict their own team's sub-limits within these maximums.
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
