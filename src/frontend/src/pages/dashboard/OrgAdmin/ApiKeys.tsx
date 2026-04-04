import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Eye, EyeOff, Key, Plus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// MOCK DATA - Phase 5 will wire to real API key management
const MOCK_API_KEYS = [
  {
    id: "key-001",
    name: "Production Integration",
    permissions: ["read", "write", "agents"],
    isActive: true,
    createdAt: "2026-01-15",
    lastUsedAt: "2026-04-04",
  },
  {
    id: "key-002",
    name: "Analytics Dashboard",
    permissions: ["read", "metrics"],
    isActive: true,
    createdAt: "2026-02-20",
    lastUsedAt: "2026-04-02",
  },
  {
    id: "key-003",
    name: "Legacy System Connector",
    permissions: ["read"],
    isActive: false,
    createdAt: "2025-11-10",
    lastUsedAt: "2026-01-30",
  },
];

export default function ApiKeys() {
  const [open, setOpen] = useState(false);
  const [showKey, setShowKey] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage API keys for external integrations
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" />
              New API Key
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">Create API Key</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Key Name</Label>
                <Input placeholder="e.g. Production Integration" />
              </div>
              <Button
                className="w-full"
                onClick={() => {
                  toast.success("API key created (Phase 5 will wire backend)");
                  setOpen(false);
                }}
              >
                Generate Key
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          <div className="divide-y divide-border/40">
            {MOCK_API_KEYS.map((key) => (
              <div key={key.id} className="flex items-center gap-4 px-5 py-4">
                <div
                  className={`p-2 rounded-lg shrink-0 ${key.isActive ? "bg-primary/10" : "bg-muted/50"}`}
                >
                  <Key
                    className={`w-4 h-4 ${key.isActive ? "text-primary" : "text-muted-foreground"}`}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium">{key.name}</p>
                    <Badge
                      variant="outline"
                      className={`text-xs ${key.isActive ? "bg-teal-500/10 text-teal-400 border-teal-500/30" : "bg-muted text-muted-foreground"}`}
                    >
                      {key.isActive ? "Active" : "Revoked"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    {showKey === key.id ? (
                      <code className="text-xs font-mono text-muted-foreground">
                        sk-live-{key.id}-xxxx-xxxx-xxxxxxxxxxxx
                      </code>
                    ) : (
                      <code className="text-xs font-mono text-muted-foreground">
                        sk-live-{"*".repeat(24)}
                      </code>
                    )}
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    {key.permissions.map((p) => (
                      <Badge key={p} variant="secondary" className="text-xs">
                        {p}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Last used: {key.lastUsedAt} • Created: {key.createdAt}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={() =>
                      setShowKey(showKey === key.id ? null : key.id)
                    }
                  >
                    {showKey === key.id ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="w-7 h-7"
                    onClick={() => {
                      navigator.clipboard.writeText(`sk-live-${key.id}-xxxx`);
                      toast.success("Copied to clipboard");
                    }}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
