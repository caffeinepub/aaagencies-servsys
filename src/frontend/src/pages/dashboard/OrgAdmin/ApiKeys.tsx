import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  AlertTriangle,
  CheckCircle2,
  Copy,
  Key,
  Plus,
  ShieldOff,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { ApiKey } from "../../../backend.d";

const PERMISSION_OPTIONS = [
  { value: "read", label: "Read", description: "Read access to all resources" },
  {
    value: "write",
    label: "Write",
    description: "Create and update resources",
  },
  {
    value: "agents",
    label: "Agents",
    description: "Manage and invoke AI agents",
  },
  {
    value: "metrics",
    label: "Metrics",
    description: "Access platform analytics",
  },
  { value: "admin", label: "Admin", description: "Administrative operations" },
];

function formatDate(ts: bigint): string {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function PermissionBadge({ perm }: { perm: string }) {
  const colorMap: Record<string, string> = {
    read: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    write: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    agents: "bg-violet-500/10 text-violet-400 border-violet-500/30",
    metrics: "bg-teal-500/10 text-teal-400 border-teal-500/30",
    admin: "bg-red-500/10 text-red-400 border-red-500/30",
  };
  const cls = colorMap[perm] ?? "bg-muted text-muted-foreground";
  return (
    <Badge variant="outline" className={`text-xs ${cls}`}>
      {perm}
    </Badge>
  );
}

interface OneTimeKeyDialogProps {
  fullKey: string;
  keyName: string;
  onClose: () => void;
}

function OneTimeKeyDialog({
  fullKey,
  keyName,
  onClose,
}: OneTimeKeyDialogProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(fullKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-display flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-400" />
            API Key Created
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-2">
          <div className="rounded-lg bg-amber-500/10 border border-amber-500/30 p-3 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <p className="text-sm text-amber-300">
              Copy this key now. For security, it will never be shown again.
            </p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Key Name
            </Label>
            <p className="text-sm font-medium">{keyName}</p>
          </div>
          <div>
            <Label className="text-xs text-muted-foreground mb-1.5 block">
              Full API Key
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 text-xs font-mono bg-muted/50 border border-border/60 rounded px-3 py-2 break-all select-all">
                {fullKey}
              </code>
              <Button
                variant="outline"
                size="icon"
                className={`shrink-0 ${copied ? "border-teal-500/50 text-teal-400" : ""}`}
                onClick={handleCopy}
              >
                {copied ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
          <Button className="w-full" onClick={onClose}>
            I've copied the key
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ApiKeys() {
  const { actor } = useActor(createActor);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [createOpen, setCreateOpen] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null);
  const [oneTimeKey, setOneTimeKey] = useState<{
    fullKey: string;
    keyName: string;
  } | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPermissions, setNewPermissions] = useState<string[]>(["read"]);
  const [creating, setCreating] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const loadKeys = useCallback(async () => {
    if (!actor) return;
    try {
      const result = await actor.listApiKeys();
      if (result.__kind__ === "ok") {
        setKeys(result.ok);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to load API keys");
    } finally {
      setLoading(false);
    }
  }, [actor]);

  useEffect(() => {
    loadKeys();
  }, [loadKeys]);

  const handleCreate = async () => {
    if (!actor || !newName.trim()) return;
    if (newPermissions.length === 0) {
      toast.error("Select at least one permission");
      return;
    }
    setCreating(true);
    try {
      const result = await actor.generateApiKey({
        name: newName.trim(),
        description: newDescription.trim(),
        permissions: newPermissions,
      });
      if (result.__kind__ === "ok") {
        const { apiKey, fullKey } = result.ok;
        setKeys((prev) => [apiKey, ...prev]);
        setCreateOpen(false);
        setNewName("");
        setNewDescription("");
        setNewPermissions(["read"]);
        setOneTimeKey({ fullKey, keyName: apiKey.name });
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to create API key");
    } finally {
      setCreating(false);
    }
  };

  const handleRevoke = async () => {
    if (!actor || !revokeTarget) return;
    setRevoking(true);
    try {
      const result = await actor.revokeApiKey(revokeTarget.id);
      if (result.__kind__ === "ok") {
        setKeys((prev) =>
          prev.map((k) =>
            k.id === revokeTarget.id ? { ...k, isActive: false } : k,
          ),
        );
        toast.success(`"${revokeTarget.name}" revoked`);
        setRevokeTarget(null);
      } else {
        toast.error(result.err);
      }
    } catch (_e) {
      toast.error("Failed to revoke key");
    } finally {
      setRevoking(false);
    }
  };

  const togglePermission = (perm: string) => {
    setNewPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm],
    );
  };

  return (
    <div className="space-y-6">
      {/* One-time key reveal dialog */}
      {oneTimeKey && (
        <OneTimeKeyDialog
          fullKey={oneTimeKey.fullKey}
          keyName={oneTimeKey.keyName}
          onClose={() => setOneTimeKey(null)}
        />
      )}

      {/* Revoke confirmation */}
      <AlertDialog
        open={!!revokeTarget}
        onOpenChange={(open) => !open && setRevokeTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">
              Revoke API Key
            </AlertDialogTitle>
            <AlertDialogDescription>
              Permanently revoke{" "}
              <strong className="text-foreground">{revokeTarget?.name}</strong>?{" "}
              Any integrations using this key will stop working immediately.
              This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRevoke}
              disabled={revoking}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {revoking ? "Revoking..." : "Revoke Key"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage API keys for external integrations
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New API Key
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-display">Create API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>
                  Key Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  placeholder="e.g. Production Integration"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="What is this key used for?"
                  rows={2}
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="resize-none"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Permissions <span className="text-destructive">*</span>
                </Label>
                <div className="space-y-2">
                  {PERMISSION_OPTIONS.map((opt) => (
                    <label
                      key={opt.value}
                      htmlFor={`perm-${opt.value}`}
                      className="flex items-start gap-3 p-2.5 rounded-md border border-border/40 hover:border-border/70 transition-colors cursor-pointer"
                    >
                      <Checkbox
                        id={`perm-${opt.value}`}
                        checked={newPermissions.includes(opt.value)}
                        onCheckedChange={() => togglePermission(opt.value)}
                        className="mt-0.5"
                      />
                      <div>
                        <p className="text-sm font-medium">{opt.label}</p>
                        <p className="text-xs text-muted-foreground">
                          {opt.description}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              <Button
                className="w-full"
                onClick={handleCreate}
                disabled={
                  creating || !newName.trim() || newPermissions.length === 0
                }
              >
                {creating ? "Generating..." : "Generate Key"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Keys list */}
      {loading ? (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-5 py-4">
                  <Skeleton className="w-8 h-8 rounded-lg" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-64" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : keys.length === 0 ? (
        <Card className="border-border/60">
          <CardContent className="py-16 text-center">
            <Key className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm font-medium">No API keys yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Create a key to allow external systems to access your org's APIs.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border/60">
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {keys.map((key) => (
                <div key={key.id} className="flex items-start gap-4 px-5 py-4">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      key.isActive ? "bg-primary/10" : "bg-muted/50"
                    }`}
                  >
                    <Key
                      className={`w-4 h-4 ${
                        key.isActive ? "text-primary" : "text-muted-foreground"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium">{key.name}</p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          key.isActive
                            ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {key.isActive ? "Active" : "Revoked"}
                      </Badge>
                    </div>
                    {key.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {key.description}
                      </p>
                    )}
                    <div className="mt-1.5">
                      <code className="text-xs font-mono text-muted-foreground bg-muted/40 px-2 py-0.5 rounded">
                        {key.keyPrefix}························
                      </code>
                    </div>
                    <div className="flex gap-1.5 mt-1.5 flex-wrap">
                      {key.permissions.map((p) => (
                        <PermissionBadge key={p} perm={p} />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1.5">
                      Created {formatDate(key.createdAt)}
                      {key.lastUsedAt
                        ? ` • Last used ${formatDate(key.lastUsedAt)}`
                        : " • Never used"}
                    </p>
                  </div>
                  {key.isActive && (
                    <div className="shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10 h-7 px-2"
                        onClick={() => setRevokeTarget(key)}
                      >
                        <ShieldOff className="w-3.5 h-3.5 mr-1" />
                        Revoke
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info card */}
      <Card className="border-border/40 bg-muted/20">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground">
            <strong className="text-foreground">Security notice:</strong> API
            keys grant programmatic access to your organization. Store them
            securely and never expose them in client-side code. Each key is
            shown in full only once at creation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
