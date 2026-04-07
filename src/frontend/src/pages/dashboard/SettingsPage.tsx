import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import { useQuery } from "@tanstack/react-query";
import {
  CalendarClock,
  ClipboardList,
  Globe,
  Loader2,
  Megaphone,
  Settings,
  Shield,
  User,
  Webhook,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../backend";
import type {
  AuditEntry,
  OrgSettings,
  PlatformSettings,
  User as UserType,
} from "../../backend.d";
import { Role } from "../../backend.d";

const LANGUAGE_OPTIONS = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "pt", label: "Portuguese" },
  { value: "ja", label: "Japanese" },
  { value: "ar", label: "Arabic" },
];

const TIMEZONE_SUGGESTIONS = [
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "Europe/London",
  "Europe/Paris",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
  "Asia/Dubai",
  "Australia/Sydney",
  "Pacific/Auckland",
];

interface SettingsPageProps {
  user: UserType;
}

// ─── Account Tab ────────────────────────────────────────────────────────────

function AccountTab({ user }: { user: UserType }) {
  const { actor } = useActor(createActor);
  const [displayName, setDisplayName] = useState(user.displayName);
  const [preferredLanguage, setPreferredLanguage] = useState(
    user.preferredLanguage || "en",
  );
  const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl ?? "");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      const result = await actor.updateMyProfile({
        displayName,
        email: user.email,
        preferredLanguage,
        avatarUrl: avatarUrl || undefined,
      });
      if ("__kind__" in result && result.__kind__ === "ok") {
        toast.success("Account settings saved");
      } else {
        const err = "err" in result ? result.err : "Unknown error";
        toast.error(`Failed to save: ${err}`);
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card data-ocid="settings.account.card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Account Settings</CardTitle>
            <CardDescription className="text-xs">
              Manage your personal profile and preferences
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name</Label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your display name"
              data-ocid="settings.account.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              value={user.email}
              disabled
              className="opacity-50 cursor-not-allowed"
              aria-description="Email cannot be changed"
            />
            <p className="text-xs text-muted-foreground">
              Email is managed by your identity provider
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="preferredLanguage">Preferred Language</Label>
            <Select
              value={preferredLanguage}
              onValueChange={setPreferredLanguage}
            >
              <SelectTrigger
                id="preferredLanguage"
                data-ocid="settings.account.select"
              >
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="avatarUrl">Avatar URL</Label>
            <Input
              id="avatarUrl"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://example.com/avatar.jpg"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Optional profile image URL
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            data-ocid="settings.account.save_button"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Account"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Organization Tab ────────────────────────────────────────────────────────

function OrgTab() {
  const { actor } = useActor(createActor);
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [settings, setSettings] = useState<OrgSettings>({
    webhookUrl: "",
    webhookEvents: [],
    notifyOnTaskComplete: true,
    notifyOnUserJoined: true,
    notifyOnAgentDeactivated: true,
    defaultLanguage: "en",
    timezone: "UTC",
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const [org] = await Promise.all([actor.getMyOrganization()]);
      if (!org) {
        setLoading(false);
        return;
      }
      setOrgId(org.id);
      const res = await actor.getOrgSettings(org.id);
      if ("__kind__" in res && res.__kind__ === "ok") {
        setSettings(res.ok);
      }
    } catch {
      toast.error("Failed to load org settings");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleWebhookEvent = (event: string) => {
    setSettings((prev) => ({
      ...prev,
      webhookEvents: prev.webhookEvents.includes(event)
        ? prev.webhookEvents.filter((e) => e !== event)
        : [...prev.webhookEvents, event],
    }));
  };

  const isTaskEventsChecked =
    settings.webhookEvents.includes("task.completed") ||
    settings.webhookEvents.includes("task.failed");

  const handleToggleTaskEvents = () => {
    if (isTaskEventsChecked) {
      setSettings((prev) => ({
        ...prev,
        webhookEvents: prev.webhookEvents.filter(
          (e) => e !== "task.completed" && e !== "task.failed",
        ),
      }));
    } else {
      setSettings((prev) => ({
        ...prev,
        webhookEvents: [
          ...prev.webhookEvents.filter(
            (e) => e !== "task.completed" && e !== "task.failed",
          ),
          "task.completed",
          "task.failed",
        ],
      }));
    }
  };

  const handleSave = async () => {
    if (!actor || !orgId) return;
    setSaving(true);
    try {
      const result = await actor.updateOrgSettings(orgId, settings);
      if ("__kind__" in result && result.__kind__ === "ok") {
        toast.success("Organization settings saved");
      } else {
        const err = "err" in result ? result.err : "Unknown error";
        toast.error(`Failed to save: ${err}`);
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!orgId) {
    return (
      <Card>
        <CardContent
          className="py-12 text-center"
          data-ocid="settings.org.empty_state"
        >
          <Globe className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground text-sm">
            You are not associated with an organization.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4" data-ocid="settings.org.card">
      {/* General */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-blue-500/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <CardTitle className="text-base">
                Organization Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Default settings for your organization
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="orgLanguage">Default Language</Label>
              <Select
                value={settings.defaultLanguage}
                onValueChange={(v) =>
                  setSettings((prev) => ({ ...prev, defaultLanguage: v }))
                }
              >
                <SelectTrigger id="orgLanguage" data-ocid="settings.org.select">
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {LANGUAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timezone">Timezone</Label>
              <Input
                id="timezone"
                value={settings.timezone}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, timezone: e.target.value }))
                }
                placeholder="America/New_York"
                list="timezone-suggestions"
                data-ocid="settings.org.input"
              />
              <datalist id="timezone-suggestions">
                {TIMEZONE_SUGGESTIONS.map((tz) => (
                  <option key={tz} value={tz} />
                ))}
              </datalist>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Webhook */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-amber-500/10 flex items-center justify-center">
              <Webhook className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <CardTitle className="text-base">Webhook Integration</CardTitle>
              <CardDescription className="text-xs">
                Real HTTP outcalls sent to your server on key events
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="webhookUrl">Webhook URL</Label>
            <Input
              id="webhookUrl"
              value={settings.webhookUrl ?? ""}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, webhookUrl: e.target.value }))
              }
              placeholder="https://your-server.com/webhook"
              type="url"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank to disable webhook delivery
            </p>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Trigger Events</Label>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Checkbox
                  id="webhookTaskEvents"
                  checked={isTaskEventsChecked}
                  onCheckedChange={handleToggleTaskEvents}
                  data-ocid="settings.org.checkbox"
                />
                <div>
                  <label
                    htmlFor="webhookTaskEvents"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Task Completed / Failed
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Fires when a task changes to completed or failed status
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="webhookUserJoined"
                  checked={settings.webhookEvents.includes("user.joined")}
                  onCheckedChange={() => toggleWebhookEvent("user.joined")}
                />
                <div>
                  <label
                    htmlFor="webhookUserJoined"
                    className="text-sm font-medium cursor-pointer"
                  >
                    User Joined
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Fires when a new user redeems an invite and joins
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Checkbox
                  id="webhookAgentDeactivated"
                  checked={settings.webhookEvents.includes("agent.deactivated")}
                  onCheckedChange={() =>
                    toggleWebhookEvent("agent.deactivated")
                  }
                />
                <div>
                  <label
                    htmlFor="webhookAgentDeactivated"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Agent Deactivated
                  </label>
                  <p className="text-xs text-muted-foreground">
                    Fires when an AI agent is deactivated in your org
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-teal-500/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-teal-400" />
            </div>
            <div>
              <CardTitle className="text-base">
                In-App Notification Preferences
              </CardTitle>
              <CardDescription className="text-xs">
                Control which events generate in-app notifications for org
                members
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Task complete notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Notify when tasks reach completed status
                </p>
              </div>
              <Switch
                checked={settings.notifyOnTaskComplete}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, notifyOnTaskComplete: v }))
                }
                data-ocid="settings.org.switch"
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">User joined notifications</p>
                <p className="text-xs text-muted-foreground">
                  Notify when a new user joins via invite link
                </p>
              </div>
              <Switch
                checked={settings.notifyOnUserJoined}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({ ...prev, notifyOnUserJoined: v }))
                }
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">
                  Agent deactivated notifications
                </p>
                <p className="text-xs text-muted-foreground">
                  Notify when an AI agent is deactivated
                </p>
              </div>
              <Switch
                checked={settings.notifyOnAgentDeactivated}
                onCheckedChange={(v) =>
                  setSettings((prev) => ({
                    ...prev,
                    notifyOnAgentDeactivated: v,
                  }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving}
          data-ocid="settings.org.save_button"
        >
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {saving ? "Saving..." : "Save Organization Settings"}
        </Button>
      </div>

      {/* Recent Activity */}
      <RecentActivitySection orgId={orgId} actor={actor} />
    </div>
  );
}

// ─── Recent Activity Section ──────────────────────────────────────────────────

function RecentActivitySection({
  orgId,
  actor,
}: { orgId: string | null; actor: any }) {
  const { data: entries = [], isLoading } = useQuery<AuditEntry[]>({
    queryKey: ["audit-log-org", orgId],
    queryFn: async () => {
      if (!actor || !orgId) return [];
      try {
        const res = await actor.getAuditLog([orgId]);
        if (res && "ok" in res) return res.ok as AuditEntry[];
        return [];
      } catch {
        return [];
      }
    },
    enabled: !!actor && !!orgId,
  });

  return (
    <div className="space-y-3" data-ocid="settings.org.panel">
      <Separator className="my-2" />
      <div className="flex items-center gap-2">
        <ClipboardList className="w-4 h-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Recent Activity</h3>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No activity recorded yet.
        </p>
      ) : (
        <div className="rounded-lg border border-border/40 bg-muted/5 divide-y divide-border/40">
          {entries.slice(0, 10).map((entry) => {
            const ms = Number(entry.timestamp / 1_000_000n);
            const dateStr = new Date(ms).toLocaleString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            });
            return (
              <div key={entry.id} className="flex flex-col gap-0.5 px-3 py-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] text-muted-foreground font-mono tabular-nums">
                    {dateStr}
                  </span>
                  <span className="text-xs font-semibold">
                    {entry.actorName}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-muted/30 px-1.5 py-0.5 rounded">
                    {entry.action}
                  </span>
                </div>
                {entry.description && (
                  <p className="text-[11px] text-muted-foreground leading-snug">
                    {entry.description}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-muted-foreground/60 italic">
        Only Super Admins can view the full platform audit log.
      </p>
    </div>
  );
}

// ─── Platform Tab ────────────────────────────────────────────────────────────

function PlatformTab() {
  const { actor } = useActor(createActor);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<PlatformSettings>({
    announcementBanner: "",
    announcementBannerEnabled: false,
  });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!actor) return;
    setLoading(true);
    try {
      const res = await actor.getPlatformSettings();
      if ("__kind__" in res && res.__kind__ === "ok") {
        setSettings(res.ok);
      }
    } catch {
      toast.error("Failed to load platform settings");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSave = async () => {
    if (!actor) return;
    setSaving(true);
    try {
      // Sends full settings including launchDate
      const result = await actor.updatePlatformSettings(settings);
      if ("__kind__" in result && result.__kind__ === "ok") {
        toast.success("Platform settings saved");
        setSettings(result.ok);
      } else {
        const err = "err" in result ? result.err : "Unknown error";
        toast.error(`Failed to save: ${err}`);
      }
    } catch {
      toast.error("An error occurred while saving");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card data-ocid="settings.platform.card">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-md bg-purple-500/10 flex items-center justify-center">
            <Megaphone className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <CardTitle className="text-base">Platform Announcement</CardTitle>
            <CardDescription className="text-xs">
              Display a banner message to all users across the platform
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="announcementBanner">Banner Message</Label>
          <Textarea
            id="announcementBanner"
            rows={3}
            value={settings.announcementBanner ?? ""}
            onChange={(e) =>
              setSettings((prev) => ({
                ...prev,
                announcementBanner: e.target.value,
              }))
            }
            placeholder="Enter announcement message..."
            data-ocid="settings.platform.textarea"
          />
          <p className="text-xs text-muted-foreground">
            This message will appear at the top of the dashboard for all users
          </p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border/60 p-4">
          <div>
            <p className="text-sm font-medium">Enable Banner</p>
            <p className="text-xs text-muted-foreground">
              Show the announcement banner to all logged-in users
            </p>
          </div>
          <Switch
            checked={settings.announcementBannerEnabled}
            onCheckedChange={(v) =>
              setSettings((prev) => ({
                ...prev,
                announcementBannerEnabled: v,
              }))
            }
            data-ocid="settings.platform.switch"
          />
        </div>

        {settings.announcementBanner && settings.announcementBannerEnabled && (
          <div className="rounded-lg bg-primary/10 border border-primary/20 px-4 py-3">
            <p className="text-xs text-primary font-medium mb-1">Preview:</p>
            <p className="text-sm text-primary">
              {settings.announcementBanner}
            </p>
          </div>
        )}

        <Separator />

        {/* Campaign Launch Date */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-4 h-4 text-muted-foreground" />
            <Label htmlFor="launchDate">Campaign Launch Date</Label>
          </div>
          <p className="text-xs text-muted-foreground">
            Set the countdown target for the /launch campaign page. Leave empty
            to show 'Coming Soon'.
          </p>
          <div className="flex gap-2">
            <Input
              id="launchDate"
              type="datetime-local"
              value={
                settings.launchDate
                  ? new Date(Number(settings.launchDate) / 1_000_000)
                      .toISOString()
                      .slice(0, 16)
                  : ""
              }
              onChange={(e) => {
                const val = e.target.value;
                if (!val) {
                  setSettings((prev) => ({ ...prev, launchDate: undefined }));
                } else {
                  const ms = new Date(val).getTime();
                  setSettings((prev) => ({
                    ...prev,
                    launchDate: BigInt(ms) * BigInt(1_000_000),
                  }));
                }
              }}
              className="flex-1"
              data-ocid="settings.platform.input"
            />
            {settings.launchDate && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() =>
                  setSettings((prev) => ({ ...prev, launchDate: undefined }))
                }
                data-ocid="settings.platform.button"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <Separator />

        <div className="flex justify-end">
          <Button
            onClick={handleSave}
            disabled={saving}
            data-ocid="settings.platform.save_button"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            {saving ? "Saving..." : "Save Platform Settings"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Export ─────────────────────────────────────────────────────────────

export default function SettingsPage({ user }: SettingsPageProps) {
  const role =
    typeof user.role === "object"
      ? Object.keys(user.role as object)[0]
      : String(user.role);

  const isOrgAdmin = role === Role.org_admin;
  const isSuperAdmin = role === Role.super_admin;

  const defaultTab = "account";

  return (
    <div className="space-y-6" data-ocid="settings.page">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-primary" />
          <h1 className="text-2xl font-display font-semibold">Settings</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Manage your account preferences, organization configuration, and
          platform settings
        </p>
      </div>

      <Tabs defaultValue={defaultTab} data-ocid="settings.tab">
        <TabsList className="mb-6">
          <TabsTrigger value="account" data-ocid="settings.account.tab">
            Account
          </TabsTrigger>
          {isOrgAdmin && (
            <TabsTrigger value="organization" data-ocid="settings.org.tab">
              Organization
            </TabsTrigger>
          )}
          {isSuperAdmin && (
            <TabsTrigger value="platform" data-ocid="settings.platform.tab">
              Platform
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="account">
          <AccountTab user={user} />
        </TabsContent>

        {isOrgAdmin && (
          <TabsContent value="organization">
            <OrgTab />
          </TabsContent>
        )}

        {isSuperAdmin && (
          <TabsContent value="platform">
            <PlatformTab />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
