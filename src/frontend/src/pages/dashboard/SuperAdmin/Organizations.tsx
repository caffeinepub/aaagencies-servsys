import { PlanTierBadge } from "@/components/PlanTierBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useInternetIdentity } from "@/hooks/useInternetIdentity";
import { MOCK_ORGS } from "@/lib/mockData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, CheckCircle2, Loader2, Plus, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function Organizations() {
  const { actor } = useActor();
  const { identity } = useInternetIdentity();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    planTier: "starter",
    primaryLanguage: "en",
  });

  const { data: orgs, isLoading } = useQuery({
    queryKey: ["all-orgs"],
    queryFn: () => actor!.getAllOrganizations(),
    enabled: !!actor,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !identity) throw new Error("Not authenticated");
      const planTierMap: Record<string, object> = {
        free: { free: null },
        starter: { starter: null },
        professional: { professional: null },
        enterprise: { enterprise: null },
      };
      const result = await actor.createOrganization({
        ownerId: identity.getPrincipal(),
        name: form.name,
        description: form.description,
        planTier: planTierMap[form.planTier] as never,
        primaryLanguage: form.primaryLanguage,
      });
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      toast.success("Organization created");
      queryClient.invalidateQueries({ queryKey: ["all-orgs"] });
      setOpen(false);
      setForm({
        name: "",
        description: "",
        planTier: "starter",
        primaryLanguage: "en",
      });
    },
    onError: (err: Error) => toast.error(err.message),
  });

  const displayOrgs = orgs && orgs.length > 0 ? orgs : MOCK_ORGS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">Organizations</h1>
          <p className="text-muted-foreground text-sm mt-1">
            All registered organizations on the platform
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-1.5" /> New Organization
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display">
                Create Organization
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Organization Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="e.g. TechVentures Global"
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Brief description"
                />
              </div>
              <div className="space-y-2">
                <Label>Plan Tier</Label>
                <Select
                  value={form.planTier}
                  onValueChange={(v) => setForm((f) => ({ ...f, planTier: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="professional">Professional</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Primary Language</Label>
                <Select
                  value={form.primaryLanguage}
                  onValueChange={(v) =>
                    setForm((f) => ({ ...f, primaryLanguage: v }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="zh">普通话</SelectItem>
                    <SelectItem value="ar">العربية</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                    <SelectItem value="sw">Kiswahili</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="w-full"
                onClick={() => createMutation.mutate()}
                disabled={createMutation.isPending || !form.name}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create Organization"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="border-border/60">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : displayOrgs.length === 0 ? (
            <div className="p-12 text-center">
              <Building2 className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">
                No organizations yet
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {displayOrgs.map((org) => {
                const planTier =
                  typeof org.planTier === "object"
                    ? Object.keys(org.planTier)[0]
                    : String(org.planTier);
                return (
                  <div
                    key={
                      "id" in org ? org.id : (org as (typeof MOCK_ORGS)[0]).id
                    }
                    className="flex items-center gap-4 px-5 py-3.5"
                  >
                    <Building2 className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{org.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {org.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <PlanTierBadge tier={planTier} />
                      {org.isActive ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-xs bg-destructive/10 text-destructive border-destructive/30"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
