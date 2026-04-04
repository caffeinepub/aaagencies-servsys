import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PLATFORM_METRICS } from "@/lib/mockData";
import {
  ArrowRightLeft,
  Building2,
  ClipboardList,
  Users,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

// MOCK DATA - Phase 5 will replace with real platform metrics API
export default function PlatformMetrics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">
          Platform Metrics
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Usage and growth analytics across the platform
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard
          title="Organizations"
          value={PLATFORM_METRICS.totalOrgs}
          icon={Building2}
          iconClassName="bg-blue-500/10"
        />
        <StatCard
          title="Users"
          value={PLATFORM_METRICS.totalUsers}
          icon={Users}
          iconClassName="bg-teal-500/10"
        />
        <StatCard
          title="Tasks"
          value={PLATFORM_METRICS.totalTasks}
          icon={ClipboardList}
          iconClassName="bg-purple-500/10"
        />
        <StatCard
          title="Wallets"
          value={PLATFORM_METRICS.totalWallets}
          icon={Wallet}
          iconClassName="bg-amber-500/10"
        />
        <StatCard
          title="Transactions"
          value={PLATFORM_METRICS.totalTransactions}
          icon={ArrowRightLeft}
          iconClassName="bg-pink-500/10"
        />
      </div>

      <Card className="border-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Monthly Growth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={PLATFORM_METRICS.monthlyGrowth}
              margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 8%)" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                stroke="oklch(0.6 0.015 265)"
              />
              <YAxis tick={{ fontSize: 12 }} stroke="oklch(0.6 0.015 265)" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "oklch(0.165 0.022 265)",
                  border: "1px solid oklch(1 0 0 / 10%)",
                  borderRadius: "6px",
                  fontSize: "12px",
                }}
              />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Bar
                dataKey="orgs"
                name="Orgs"
                fill="oklch(0.60 0.22 262)"
                radius={[3, 3, 0, 0]}
              />
              <Bar
                dataKey="users"
                name="Users"
                fill="oklch(0.68 0.18 162)"
                radius={[3, 3, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
