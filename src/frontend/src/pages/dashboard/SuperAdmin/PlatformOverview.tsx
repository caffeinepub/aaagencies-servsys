import { PlanTierBadge } from "@/components/PlanTierBadge";
import { RoleBadge } from "@/components/RoleBadge";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { MOCK_ORGS, MOCK_USERS, PLATFORM_METRICS } from "@/lib/mockData";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  Building2,
  CheckCircle2,
  Users,
  Wallet,
  XCircle,
} from "lucide-react";

export default function PlatformOverview() {
  const { actor } = useActor();

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

  const displayOrgs = orgs && orgs.length > 0 ? orgs : MOCK_ORGS;
  const displayUsers = users && users.length > 0 ? users : MOCK_USERS;

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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Organizations"
          value={PLATFORM_METRICS.totalOrgs}
          icon={Building2}
          iconClassName="bg-blue-500/10"
          trend={{ value: 4.4, label: "this month" }}
        />
        <StatCard
          title="Total Users"
          value={PLATFORM_METRICS.totalUsers}
          icon={Users}
          iconClassName="bg-teal-500/10"
          trend={{ value: 3.6, label: "this month" }}
        />
        <StatCard
          title="Active Tasks"
          value={PLATFORM_METRICS.totalTasks}
          icon={BarChart3}
          iconClassName="bg-purple-500/10"
          trend={{ value: 5.5, label: "this month" }}
        />
        <StatCard
          title="Wallets"
          value={PLATFORM_METRICS.totalWallets}
          icon={Wallet}
          iconClassName="bg-amber-500/10"
          trend={{ value: 2.1, label: "this month" }}
        />
      </div>

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
            ) : (
              <div className="space-y-3">
                {displayOrgs.slice(0, 5).map((org) => {
                  const planTier =
                    typeof org.planTier === "object"
                      ? Object.keys(org.planTier)[0]
                      : String(org.planTier);
                  const name =
                    "name" in org
                      ? org.name
                      : (org as (typeof MOCK_ORGS)[0]).name;
                  const isActive = "isActive" in org ? org.isActive : true;
                  return (
                    <div
                      key={
                        "id" in org ? org.id : (org as (typeof MOCK_ORGS)[0]).id
                      }
                      className="flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <Building2 className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <PlanTierBadge tier={planTier} />
                        {isActive ? (
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
            ) : (
              <div className="space-y-3">
                {displayUsers.slice(0, 6).map((user) => {
                  const role =
                    typeof user.role === "object"
                      ? Object.keys(user.role)[0]
                      : String(user.role);
                  const name = user.displayName;
                  return (
                    <div
                      key={user.email}
                      className="flex items-center justify-between gap-3"
                    >
                      <span className="text-sm font-medium truncate">
                        {name}
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
