import { PlanTierBadge } from "@/components/PlanTierBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import type { MockOrg } from "@/lib/mockData";
import { MOCK_ORGS } from "@/lib/mockData";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Languages, Loader2, Pencil } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Organization } from "../../../backend.d";

type DisplayOrg = {
  name: string;
  description: string;
  isActive: boolean;
  primaryLanguage: string;
  supportedLanguages: string[];
  planTier: string;
  logoUrl?: string;
};

function toDisplayOrg(org: Organization | null | undefined): DisplayOrg {
  if (!org) {
    const mock: MockOrg = MOCK_ORGS[0];
    return {
      name: mock.name,
      description: mock.description,
      isActive: mock.isActive,
      primaryLanguage: mock.primaryLanguage,
      supportedLanguages: mock.supportedLanguages,
      planTier: mock.planTier,
      logoUrl: undefined,
    };
  }
  const planTier =
    typeof org.planTier === "object"
      ? (Object.keys(org.planTier)[0] ?? "free")
      : String(org.planTier);
  return {
    name: org.name,
    description: org.description,
    isActive: org.isActive,
    primaryLanguage: org.primaryLanguage,
    supportedLanguages: org.supportedLanguages,
    planTier,
    logoUrl: org.logoUrl,
  };
}

type EditForm = {
  name: string;
  description: string;
  logoUrl: string;
  primaryLanguage: string;
  supportedLanguages: string; // comma-separated
};

export default function MyOrganization() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<EditForm>({
    name: "",
    description: "",
    logoUrl: "",
    primaryLanguage: "",
    supportedLanguages: "",
  });

  const { data: org, isLoading } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor && !isFetching,
  });

  const displayOrg = toDisplayOrg(org);

  const startEditing = () => {
    setForm({
      name: displayOrg.name,
      description: displayOrg.description,
      logoUrl: displayOrg.logoUrl ?? "",
      primaryLanguage: displayOrg.primaryLanguage,
      supportedLanguages: displayOrg.supportedLanguages.join(", "),
    });
    setEditing(true);
  };

  const updateMutation = useMutation({
    mutationFn: async (editForm: EditForm) => {
      if (!actor || !org?.id) throw new Error("Not connected");
      const input = {
        name: editForm.name,
        description: editForm.description,
        logoUrl: editForm.logoUrl ? editForm.logoUrl : undefined,
        primaryLanguage: editForm.primaryLanguage,
        supportedLanguages: editForm.supportedLanguages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const result = await (actor as any).updateOrganization(org.id, input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-org"] });
      setEditing(false);
      toast.success("Organization updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            My Organization
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organization settings and configuration
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={editing ? () => setEditing(false) : startEditing}
          data-ocid="org.edit_button"
        >
          <Pencil className="w-3.5 h-3.5 mr-1.5" />
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {editing ? (
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-base font-display">
              Edit Organization
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Organization Name</Label>
                <Input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  placeholder="Your organization name"
                  data-ocid="org.input"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Description</Label>
                <Input
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Describe your organization"
                  data-ocid="org.input"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Logo URL{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  value={form.logoUrl}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, logoUrl: e.target.value }))
                  }
                  placeholder="https://..."
                  data-ocid="org.input"
                />
              </div>
              <div className="space-y-2">
                <Label>Primary Language</Label>
                <Input
                  value={form.primaryLanguage}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, primaryLanguage: e.target.value }))
                  }
                  placeholder="e.g. en"
                  data-ocid="org.input"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>
                  Supported Languages{" "}
                  <span className="text-muted-foreground font-normal">
                    (comma-separated, e.g. en, es, fr)
                  </span>
                </Label>
                <Input
                  value={form.supportedLanguages}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      supportedLanguages: e.target.value,
                    }))
                  }
                  placeholder="en, es, fr, ar"
                  data-ocid="org.input"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => updateMutation.mutate(form)}
                disabled={
                  updateMutation.isPending || !form.name || !form.description
                }
                data-ocid="org.save_button"
              >
                {updateMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
                data-ocid="org.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" /> Organization
                Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayOrg.logoUrl && (
                <div>
                  <p className="text-xs text-muted-foreground">Logo</p>
                  <img
                    src={displayOrg.logoUrl}
                    alt="Org logo"
                    className="h-10 mt-1 rounded object-contain"
                  />
                </div>
              )}
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="text-sm font-medium">{displayOrg.name}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Description</p>
                <p className="text-sm">{displayOrg.description}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Plan</p>
                <PlanTierBadge tier={displayOrg.planTier} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <Badge
                  variant="outline"
                  className={
                    displayOrg.isActive
                      ? "bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs"
                      : "text-xs"
                  }
                >
                  {displayOrg.isActive ? "Active" : "Inactive"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Languages className="w-4 h-4 text-primary" /> Language Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground">
                  Primary Language
                </p>
                <p className="text-sm font-medium">
                  {displayOrg.primaryLanguage.toUpperCase()}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">
                  Supported Languages
                </p>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {displayOrg.supportedLanguages.map((lang: string) => (
                    <Badge key={lang} variant="secondary" className="text-xs">
                      {lang.toUpperCase()}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
