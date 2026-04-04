import { RoleBadge } from "@/components/RoleBadge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
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
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  CalendarDays,
  Check,
  Clock,
  Copy,
  Globe2,
  Mail,
  Pencil,
  Shield,
  X,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const LANGUAGES = [
  { code: "en", label: "🇺🇸 English" },
  { code: "es", label: "🇪🇸 Español" },
  { code: "fr", label: "🇫🇷 Français" },
  { code: "zh", label: "🇨🇳 普通话" },
  { code: "ar", label: "🇸🇦 العربية" },
  { code: "pt", label: "🇧🇷 Português" },
  { code: "sw", label: "🇰🇪 Kiswahili" },
];

interface UpdateProfileInput {
  displayName: string;
  email: string;
  preferredLanguage: string;
  avatarUrl?: string;
}

// Extended actor type for new backend methods not yet in generated types
interface ExtendedActor {
  updateMyProfile(input: UpdateProfileInput): Promise<
    | {
        __kind__: "ok";
        ok: {
          displayName: string;
          email: string;
          preferredLanguage: string;
          avatarUrl?: string;
        };
      }
    | { __kind__: "err"; err: string }
  >;
}

function formatDate(ts: bigint | undefined): string {
  if (!ts) return "—";
  const ms = Number(ts);
  // Motoko timestamps are in nanoseconds if > 1e15, else milliseconds
  const date = new Date(ms > 1e15 ? ms / 1_000_000 : ms);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function truncatePrincipal(principal: string): string {
  if (principal.length <= 20) return principal;
  return `${principal.slice(0, 10)}…${principal.slice(-8)}`;
}

export default function ProfilePage() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [copied, setCopied] = useState(false);

  const { data: profile, isLoading } = useQuery({
    queryKey: ["my-profile"],
    queryFn: () => actor!.getMyProfile(),
    enabled: !!actor,
  });

  const [formData, setFormData] = useState<UpdateProfileInput>({
    displayName: "",
    email: "",
    preferredLanguage: "en",
    avatarUrl: "",
  });

  const updateMutation = useMutation({
    mutationFn: async (input: UpdateProfileInput) => {
      if (!actor) throw new Error("Not connected");
      const extActor = actor as unknown as ExtendedActor;
      const result = await extActor.updateMyProfile(input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Profile updated");
      queryClient.invalidateQueries({ queryKey: ["my-profile"] });
      setEditing(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  const role = profile
    ? typeof profile.role === "object"
      ? Object.keys(profile.role)[0]
      : String(profile.role)
    : "end_customer";

  const initials = profile
    ? profile.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "??";

  const principalStr = identity?.getPrincipal().toString() ?? "";

  function startEditing() {
    if (profile) {
      setFormData({
        displayName: profile.displayName,
        email: profile.email,
        preferredLanguage: profile.preferredLanguage ?? "en",
        avatarUrl: profile.avatarUrl ?? "",
      });
    }
    setEditing(true);
  }

  function cancelEditing() {
    setEditing(false);
  }

  async function copyPrincipal() {
    if (!principalStr) return;
    await navigator.clipboard.writeText(principalStr);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (isLoading) {
    return (
      <div className="space-y-6" data-ocid="profile.loading_state">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Card className="border-border/60">
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-6">
              <Skeleton className="w-16 h-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
            <div className="space-y-4">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold">My Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your account information and preferences
          </p>
        </div>
        {!editing && (
          <Button
            variant="outline"
            size="sm"
            onClick={startEditing}
            data-ocid="profile.edit_button"
          >
            <Pencil className="w-3.5 h-3.5 mr-1.5" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Avatar + identity card */}
      <Card className="border-border/60">
        <CardContent className="p-6">
          {/* Avatar row */}
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              {profile?.avatarUrl && (
                <AvatarImage
                  src={profile.avatarUrl}
                  alt={profile.displayName}
                />
              )}
              <AvatarFallback className="text-xl font-display font-semibold bg-primary/15 text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-display font-semibold text-lg leading-tight">
                {profile?.displayName ?? "User"}
              </p>
              <div className="mt-1">
                <RoleBadge role={role} />
              </div>
            </div>
          </div>

          <Separator className="mb-5" />

          {editing ? (
            /* Edit mode */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="displayName">Display Name</Label>
                  <Input
                    id="displayName"
                    value={formData.displayName}
                    onChange={(e) =>
                      setFormData((f) => ({
                        ...f,
                        displayName: e.target.value,
                      }))
                    }
                    placeholder="Your full name"
                    data-ocid="profile.input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, email: e.target.value }))
                    }
                    placeholder="you@example.com"
                    data-ocid="profile.input"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Preferred Language</Label>
                <Select
                  value={formData.preferredLanguage}
                  onValueChange={(v) =>
                    setFormData((f) => ({ ...f, preferredLanguage: v }))
                  }
                >
                  <SelectTrigger data-ocid="profile.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl">
                  Avatar URL{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  value={formData.avatarUrl ?? ""}
                  onChange={(e) =>
                    setFormData((f) => ({ ...f, avatarUrl: e.target.value }))
                  }
                  placeholder="https://example.com/avatar.jpg"
                  data-ocid="profile.input"
                />
                {formData.avatarUrl && (
                  <div className="flex items-center gap-2 pt-1">
                    <Avatar className="w-8 h-8">
                      <AvatarImage
                        src={formData.avatarUrl}
                        alt="Preview"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).style.display =
                            "none";
                        }}
                      />
                      <AvatarFallback className="text-xs bg-primary/15 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs text-muted-foreground">
                      Avatar preview
                    </span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Button
                  size="sm"
                  onClick={() => updateMutation.mutate(formData)}
                  disabled={
                    updateMutation.isPending ||
                    !formData.displayName ||
                    !formData.email
                  }
                  data-ocid="profile.save_button"
                >
                  {updateMutation.isPending ? (
                    <>
                      <span className="w-3.5 h-3.5 mr-1.5 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5 mr-1.5" />
                      Save Changes
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={cancelEditing}
                  disabled={updateMutation.isPending}
                  data-ocid="profile.cancel_button"
                >
                  <X className="w-3.5 h-3.5 mr-1.5" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            /* View mode */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Mail className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Email
                  </span>
                </div>
                <p className="text-sm font-medium">{profile?.email ?? "—"}</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Globe2 className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Language
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {LANGUAGES.find((l) => l.code === profile?.preferredLanguage)
                    ?.label ??
                    profile?.preferredLanguage?.toUpperCase() ??
                    "—"}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Member Since
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {formatDate(profile?.createdAt)}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Last Login
                  </span>
                </div>
                <p className="text-sm font-medium">
                  {formatDate(profile?.lastLoginAt)}
                </p>
              </div>

              <div className="sm:col-span-2 space-y-1">
                <div className="flex items-center gap-1.5 text-muted-foreground">
                  <Shield className="w-3.5 h-3.5" />
                  <span className="text-xs font-medium uppercase tracking-wide">
                    Principal ID
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <code className="text-xs font-mono text-muted-foreground">
                    {truncatePrincipal(principalStr)}
                  </code>
                  <button
                    type="button"
                    onClick={copyPrincipal}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded hover:bg-muted/40"
                    title="Copy full Principal ID"
                    aria-label="Copy Principal ID"
                    data-ocid="profile.button"
                  >
                    {copied ? (
                      <Check className="w-3.5 h-3.5 text-teal-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
