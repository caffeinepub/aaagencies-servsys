import type {
  backendInterface as FullBackend,
  Notification,
  NotificationType,
} from "@/../src/backend.d";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { cn } from "@/lib/utils";
import {
  Bell,
  BotOff,
  Building2,
  CheckCircle2,
  Megaphone,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

type IconConfig = {
  icon: LucideIcon;
  color: string;
  bg: string;
};

const TYPE_CONFIG: Record<NotificationType, IconConfig> = {
  taskStatusChanged: {
    icon: CheckCircle2,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
  inviteRedeemed: {
    icon: UserCheck,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  agentDeactivated: {
    icon: BotOff,
    color: "text-amber-400",
    bg: "bg-amber-500/10",
  },
  systemMessage: {
    icon: Megaphone,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
  orgCreated: {
    icon: Building2,
    color: "text-teal-400",
    bg: "bg-teal-500/10",
  },
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
  if (diffMinutes < 60)
    return `${diffMinutes} min${diffMinutes !== 1 ? "s" : ""} ago`;
  if (diffHours < 24)
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  return new Date(thenMs).toLocaleDateString();
}

interface NotificationRowProps {
  notification: Notification;
  onRead: (id: string) => void;
}

function NotificationRow({ notification, onRead }: NotificationRowProps) {
  const config = TYPE_CONFIG[notification.notificationType] ?? {
    icon: Bell,
    color: "text-muted-foreground",
    bg: "bg-muted",
  };
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={() => !notification.isRead && onRead(notification.id)}
      className={cn(
        "w-full text-left flex items-start gap-3 px-4 py-3 transition-colors hover:bg-accent/50 border-b border-border/40 last:border-0",
        !notification.isRead && "border-l-2 border-l-primary",
        notification.isRead && "opacity-60",
      )}
      data-ocid={`notification.item.${notification.id}`}
    >
      <div
        className={cn(
          "shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5",
          config.bg,
        )}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-sm font-medium leading-snug",
            notification.isRead ? "text-muted-foreground" : "text-foreground",
          )}
        >
          {notification.title}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
          {notification.message}
        </p>
        <p className="text-xs text-muted-foreground/60 mt-1">
          {toRelativeTime(notification.createdAt)}
        </p>
      </div>
      {!notification.isRead && (
        <div className="shrink-0 w-2 h-2 rounded-full bg-primary mt-2" />
      )}
    </button>
  );
}

export function NotificationCenter() {
  const { actor: _actor, isFetching } = useActor();
  const actor = _actor as unknown as FullBackend | null;

  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchNotifications = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.getMyNotifications();
      if (result.__kind__ === "ok") {
        setNotifications(result.ok);
      }
    } catch {
      // Silently fail for polling
    }
  }, [actor]);

  // Initial load
  useEffect(() => {
    if (!actor || isFetching) return;
    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));
  }, [actor, isFetching, fetchNotifications]);

  // Polling every 30 seconds
  useEffect(() => {
    if (!actor || isFetching) return;
    pollRef.current = setInterval(fetchNotifications, 30_000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [actor, isFetching, fetchNotifications]);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const badgeLabel = unreadCount > 9 ? "9+" : String(unreadCount);

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen);
    if (isOpen && unreadCount > 0 && actor) {
      // Optimistic update — mark all as read in local state immediately
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      try {
        await actor.markAllNotificationsRead();
      } catch {
        // Refresh on failure
        fetchNotifications();
      }
    }
  };

  const handleMarkAllRead = async () => {
    if (!actor) return;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await actor.markAllNotificationsRead();
    } catch {
      fetchNotifications();
    }
  };

  const handleMarkRead = async (id: string) => {
    if (!actor) return;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await actor.markNotificationRead(id);
    } catch {
      fetchNotifications();
    }
  };

  return (
    <>
      {/* Bell button */}
      <div className="relative" data-ocid="notifications.bell.button">
        <Button
          variant="ghost"
          size="icon"
          className="relative w-9 h-9"
          onClick={() => handleOpen(true)}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className="w-4.5 h-4.5" />
          {unreadCount > 0 && (
            <span
              className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center px-1 leading-none"
              aria-hidden="true"
            >
              {badgeLabel}
            </span>
          )}
        </Button>
      </div>

      {/* Sheet drawer */}
      <Sheet open={open} onOpenChange={handleOpen}>
        <SheetContent
          side="right"
          className="w-full sm:w-[400px] p-0 flex flex-col"
          data-ocid="notifications.sheet"
        >
          <SheetHeader className="px-4 py-4 border-b border-border/60 shrink-0">
            <div className="flex items-center justify-between">
              <SheetTitle className="font-display text-base">
                Notifications
              </SheetTitle>
              {notifications.some((n) => !n.isRead) && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-foreground h-7 px-2"
                  onClick={handleMarkAllRead}
                  data-ocid="notifications.mark_all_read.button"
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </SheetHeader>

          <ScrollArea className="flex-1">
            {isLoading ? (
              <div className="divide-y divide-border/40">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3 px-4 py-3">
                    <Skeleton className="w-8 h-8 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div
                className="flex flex-col items-center justify-center py-16 text-muted-foreground gap-3"
                data-ocid="notifications.empty_state"
              >
                <Bell className="w-10 h-10 opacity-20" />
                <div className="text-center">
                  <p className="text-sm font-medium">No notifications yet</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    We'll notify you when something happens
                  </p>
                </div>
              </div>
            ) : (
              <div>
                {notifications.map((notification) => (
                  <NotificationRow
                    key={notification.id}
                    notification={notification}
                    onRead={handleMarkRead}
                  />
                ))}
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </>
  );
}
