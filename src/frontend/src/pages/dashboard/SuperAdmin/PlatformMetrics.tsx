import type {
  ActivityEvent,
  backendInterface as FullBackend,
} from "@/../src/backend.d";
import { ActivityFeed } from "@/components/ActivityFeed";
import { StatCard } from "@/components/StatCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import { Bot, Building2, ClipboardList, Users, Wallet } from "lucide-react";
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
import { createActor } from "../../../backend";

function getDayLabel(date: Date): string {
  return date.toLocaleDateString("en-US", { weekday: "short" });
}

function buildEventTrend(
  events: ActivityEvent[],
): { day: string; events: number }[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const days: { day: string; date: Date; events: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push({ day: getDayLabel(d), date: d, events: 0 });
  }

  for (const event of events) {
    const eventMs = Number(event.timestamp) / 1_000_000;
    const eventDate = new Date(eventMs);
    eventDate.setHours(0, 0, 0, 0);
    for (const bucket of days) {
      if (eventDate.getTime() === bucket.date.getTime()) {
        bucket.events++;
        break;
      }
    }
  }

  return days.map(({ day, events }) => ({ day, events }));
}

export default function PlatformMetrics() {
  const { actor: _actor } = useActor(createActor);
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

  const { data: feedResult, isLoading: feedLoading } = useQuery({
    queryKey: ["activity-feed", null],
    queryFn: async () => {
      const result = await actor!.getActivityFeed(null);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor,
  });

  const events: ActivityEvent[] = feedResult ?? [];
  const trendData = buildEventTrend(events);

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
            value={Number(metrics?.totalOrgs ?? 0)}
            icon={Building2}
            iconClassName="bg-blue-500/10"
          />
          <StatCard
            title="Users"
            value={Number(metrics?.totalUsers ?? 0)}
            icon={Users}
            iconClassName="bg-teal-500/10"
          />
          <StatCard
            title="Tasks"
            value={Number(metrics?.totalTasks ?? 0)}
            icon={ClipboardList}
            iconClassName="bg-purple-500/10"
          />
          <StatCard
            title="Wallets"
            value={Number(metrics?.totalWallets ?? 0)}
            icon={Wallet}
            iconClassName="bg-amber-500/10"
          />
          <StatCard
            title="Agents"
            value={Number(metrics?.totalAgents ?? 0)}
            icon={Bot}
            iconClassName="bg-pink-500/10"
          />
        </div>
      )}

      {/* 7-Day Activity Trend Chart */}
      <Card
        className="border-border/60"
        data-ocid="platform.metrics.trend.card"
      >
        <CardHeader className="pb-2">
          <CardTitle className="text-base font-display">
            Platform Activity (Last 7 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart
                data={trendData}
                margin={{ top: 5, right: 10, left: -10, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="oklch(1 0 0 / 8%)"
                />
                <XAxis
                  dataKey="day"
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.6 0.015 265)"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  stroke="oklch(0.6 0.015 265)"
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "oklch(0.165 0.022 265)",
                    border: "1px solid oklch(1 0 0 / 10%)",
                    borderRadius: "6px",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "oklch(1 0 0 / 4%)" }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar
                  dataKey="events"
                  name="Platform Events"
                  fill="oklch(0.60 0.22 262)"
                  radius={[3, 3, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <ActivityFeed orgId={null} />
    </div>
  );
}
