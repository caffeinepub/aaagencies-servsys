import type {
  ActivityEvent,
  ActivityEventType,
  backendInterface as FullBackend,
} from "@/../src/backend.d";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bot,
  BotOff,
  Building2,
  CheckCircle2,
  ClipboardPlus,
  UserCheck,
  UserPlus,
  Wallet,
  XCircle,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { createActor } from "../backend";

interface ActivityFeedProps {
  orgId: string | null;
  maxItems?: number;
}

type IconConfig = {
  icon: LucideIcon;
  color: string;
};

const EVENT_CONFIG: Record<ActivityEventType, IconConfig> = {
  taskCreated: { icon: ClipboardPlus, color: "text-amber-400" },
  taskCompleted: { icon: CheckCircle2, color: "text-teal-400" },
  taskFailed: { icon: XCircle, color: "text-destructive" },
  agentRegistered: { icon: Bot, color: "text-purple-400" },
  agentDeactivated: { icon: BotOff, color: "text-muted-foreground" },
  userInvited: { icon: UserPlus, color: "text-blue-400" },
  userJoined: { icon: UserCheck, color: "text-teal-400" },
  walletCreated: { icon: Wallet, color: "text-amber-400" },
  orgCreated: { icon: Building2, color: "text-blue-400" },
};

function toRelativeTime(timestampNs: bigint): string {
  const nowMs = Date.now();
  const thenMs = Number(timestampNs) / 1_000_000;
  const diffMs = nowMs - thenMs;
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return new Date(thenMs).toLocaleDateString();
}

function ActivityRow({ event }: { event: ActivityEvent }) {
  const config = EVENT_CONFIG[event.eventType] ?? {
    icon: Activity,
    color: "text-muted-foreground",
  };
  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3 px-4">
      <div className="shrink-0 mt-0.5">
        <Icon className={`w-4 h-4 ${config.color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm leading-snug">
          <span className="font-medium">{event.actorName}</span>{" "}
          <span className="text-muted-foreground">{event.description}</span>
        </p>
        {event.targetName && (
          <p className="text-xs text-muted-foreground/70 mt-0.5 truncate">
            {event.targetName}
          </p>
        )}
      </div>
      <span className="text-xs text-muted-foreground shrink-0 mt-0.5">
        {toRelativeTime(event.timestamp)}
      </span>
    </div>
  );
}

export function ActivityFeed({ orgId, maxItems = 20 }: ActivityFeedProps) {
  const { actor: _actor } = useActor(createActor);
  const actor = _actor as unknown as FullBackend | null;

  const { data: feedResult, isLoading } = useQuery({
    queryKey: ["activity-feed", orgId],
    queryFn: async () => {
      const result = await actor!.getActivityFeed(orgId);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    enabled: !!actor,
  });

  const events: ActivityEvent[] = (feedResult ?? []).slice(0, maxItems);

  return (
    <Card className="border-border/60">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-display flex items-center gap-2">
          <Activity className="w-4 h-4 text-primary" />
          Activity Feed
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 pb-2">
        {isLoading ? (
          <div className="divide-y divide-border/40">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-start gap-3 py-3 px-4">
                <Skeleton className="h-4 w-4 rounded-full shrink-0 mt-0.5" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3.5 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
                <Skeleton className="h-3 w-12 shrink-0" />
              </div>
            ))}
          </div>
        ) : events.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2"
            data-ocid="activity.empty_state"
          >
            <Activity className="w-7 h-7 opacity-25" />
            <span className="text-sm">No activity yet</span>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {events.map((event) => (
              <ActivityRow key={event.id} event={event} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
