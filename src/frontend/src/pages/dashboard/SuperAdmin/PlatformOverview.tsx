import type { backendInterface as FullBackend } from "@/../src/backend.d";
import { PlanTierBadge } from "@/components/PlanTierBadge";
import { RoleBadge } from "@/components/RoleBadge";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

const TIER_KEYS = ["free", "starter", "professional", "enterprise"] as const;
type TierKey = (typeof TIER_KEYS)[number];

export default function PlatformOverview() {
  const { actor: _actor } = useActor();
  const actor = _actor as unknown as FullBackend | null;

  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ["platform-metrics"],
    queryFn: async () => {
      const result = await actor!.getPlatformMetrics();
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor,
  });

  const { data: orgs, isLoading: orgsLoading } = useQuery({
    queryKey: ["all-orgs"],
    queryFn: () => actor!.getAllOrganizations(),
    enabled: !!actor,
  });

  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ["all-users"],
    queryFn: () => actor!.getAllUsers(),
    enabled: !!actor,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">
          Platform Overview
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Real-time view of the AAAgencies SerVSys platform
        </p>
      </div>

      {/* Stat cards */}
      {metricsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-28 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard
            title="Organizations"
            value={metrics?.totalOrgs ?? 0}
            icon={Building2}
            iconClassName="bg-blue-500/10"
          />
          <StatCard
            title="Total Users"
            value={metrics?.totalUsers ?? 0}
            icon={Users}
            iconClassName="bg-teal-500/10"
          />
          <StatCard
            title="Active Tasks"
            value={metrics?.totalTasks ?? 0}
            icon={BarChart3}
            iconClassName="bg-purple-500/10"
          />
          <StatCard
            title="Wallets"
            value={metrics?.totalWallets ?? 0}
            icon={Wallet}
            iconClassName="bg-amber-500/10"
          />
          <StatCard
            title="Active Orgs"
            value={metrics?.activeOrgs ?? 0}
            icon={CheckCircle2}
            iconClassName="bg-green-500/10"
          />
        </div>
      )}

      {/* By Plan Tier breakdown */}
      <Card className="border-border/60" data-ocid="platform.overview.panel">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Orgs by Plan Tier
          </CardTitle>
        </CardHeader>
        <CardContent>
          {metricsLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-8 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {TIER_KEYS.map((tier) => (
                <div
                  key={tier}
                  className="flex items-center justify-between gap-3"
                >
                  <PlanTierBadge tier={tier} />
                  <span className="text-sm font-medium tabular-nums">
                    {metrics?.orgsByPlan?.[tier as TierKey] ?? 0}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orgs */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Recent Organizations
            </CardTitle>
          </CardHeader>
          <CardContent>
            {orgsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !orgs || orgs.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"
                data-ocid="platform.orgs.empty_state"
              >
                <Building2 className="w-8 h-8 opacity-30" />
                <span className="text-sm">No organizations yet</span>
              </div>
            ) : (
              <div className="space-y-3">
                {orgs.slice(0, 5).map((org) => {
                  const planTier =
                    typeof org.planTier === "object"
                      ? Object.keys(org.planTier)[0]
                      : String(org.planTier);
                  return (
                    <div
                      key={org.id}
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {org.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PlanTierBadge tier={planTier} />
                        {org.isActive ? (
                          <CheckCircle2 className="w-4 h-4 text-teal-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-destructive" />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card className="border-border/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            {usersLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : !users || users.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-8 text-muted-foreground gap-2"
                data-ocid="platform.users.empty_state"
              >
                <Users className="w-8 h-8 opacity-30" />
                <span className="text-sm">No users yet</span>
              </div>
            ) : (
              <div className="space-y-3">
                {users.slice(0, 6).map((user) => {
                  const role =
                    typeof user.role === "object"
                      ? Object.keys(user.role)[0]
                      : String(user.role);
                  return (
                    <div
                      key={user.email}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-medium truncate">
                        {user.displayName}
                      </span>
                      <RoleBadge role={role} />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
