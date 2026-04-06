import { PlanTierBadge } from "@/components/PlanTierBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@/hooks/useActor";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, Languages, Loader2, Pencil } from "lucide-react";
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
  customDomain?: string;
  customSubdomain?: string;
};

function unwrapOptional(val: unknown): string | undefined {
  if (Array.isArray(val)) return val[0] ?? undefined;
  if (val === null || val === undefined) return undefined;
  return val as string;
}

function toDisplayOrg(org: Organization | null | undefined): DisplayOrg | null {
  if (!org) return null;
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
    customDomain: unwrapOptional(org.customDomain),
    customSubdomain: unwrapOptional(org.customSubdomain),
  };
}

type EditForm = {
  name: string;
  description: string;
  logoUrl: string;
  primaryLanguage: string;
  supportedLanguages: string; // comma-separated
  customDomain: string;
  customSubdomain: string;
};

export default function MyOrganization() {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<EditForm>({
    name: "",
    description: "",
    logoUrl: "",
    primaryLanguage: "",
    supportedLanguages: "",
    customDomain: "",
    customSubdomain: "",
  });

  const { data: org, isLoading } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor && !isFetching,
  });

  const displayOrg = toDisplayOrg(org);

  const startEditing = () => {
    if (!displayOrg) return;
    setForm({
      name: displayOrg.name,
      description: displayOrg.description,
      logoUrl: displayOrg.logoUrl ?? "",
      primaryLanguage: displayOrg.primaryLanguage,
      supportedLanguages: displayOrg.supportedLanguages.join(", "),
      customDomain: displayOrg.customDomain ?? "",
      customSubdomain: displayOrg.customSubdomain ?? "",
    });
    setEditing(true);
  };

  const handleSave = async () => {
    if (!actor || !org?.id) return;
    setIsSaving(true);
    try {
      const input = {
        name: form.name,
        description: form.description,
        logoUrl: form.logoUrl ? form.logoUrl : undefined,
        primaryLanguage: form.primaryLanguage,
        supportedLanguages: form.supportedLanguages
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      const [orgResult, domainResult] = await Promise.all([
        (actor as any).updateOrganization(org.id, input),
        (actor as any).updateOrgDomain(
          org.id,
          form.customDomain.trim() || null,
          form.customSubdomain.trim() || null,
        ),
      ]);
      if (orgResult.__kind__ === "err") throw new Error(orgResult.err);
      if (domainResult.__kind__ === "err") throw new Error(domainResult.err);
      queryClient.invalidateQueries({ queryKey: ["my-org"] });
      setEditing(false);
      toast.success("Organization updated successfully");
    } catch (err: any) {
      toast.error(err.message ?? "Failed to save changes");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <Skeleton className="h-64 w-full" />;

  if (!displayOrg) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            My Organization
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Organization settings and configuration
          </p>
        </div>
        <Card className="border-border/60">
          <CardContent className="py-10 text-center">
            <p className="text-muted-foreground text-sm">
              No organization found. Contact your Super Admin.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <div className="space-y-2">
                <Label>Custom Domain</Label>
                <Input
                  value={form.customDomain}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customDomain: e.target.value }))
                  }
                  placeholder="myagency.com"
                  data-ocid="org.input"
                />
                <p className="text-xs text-muted-foreground">
                  Your branded domain (optional)
                </p>
              </div>
              <div className="space-y-2">
                <Label>Custom Subdomain</Label>
                <Input
                  value={form.customSubdomain}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, customSubdomain: e.target.value }))
                  }
                  placeholder="myagency"
                  data-ocid="org.input"
                />
                <p className="text-xs text-muted-foreground">
                  Your branded subdomain on this platform (optional)
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !form.name || !form.description}
                data-ocid="org.save_button"
              >
                {isSaving ? (
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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {/* Card 1: Organization Details */}
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

          {/* Card 2: Language Settings */}
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

          {/* Card 3: Custom Domain & Branding */}
          <Card className="border-border/60 md:col-span-2 xl:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-display flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" /> Custom Domain &amp;
                Branding
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {displayOrg.customDomain || displayOrg.customSubdomain ? (
                <>
                  {displayOrg.customDomain && (
                    <div>
                      <p className="text-xs text-muted-foreground">
                        Custom Domain
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <code className="font-mono text-sm bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                          {displayOrg.customDomain}
                        </code>
                        <Badge
                          className="bg-teal-500/10 text-teal-400 border-teal-500/30 text-xs"
                          variant="outline"
                        >
                          Branded Portal
                        </Badge>
                      </div>
                    </div>
                  )}
                  {displayOrg.customSubdomain && (
                    <div>
                      <p className="text-xs text-muted-foreground">Subdomain</p>
                      <div className="mt-1">
                        <code className="font-mono text-sm bg-muted/50 px-2 py-0.5 rounded border border-border/40">
                          {displayOrg.customSubdomain}
                        </code>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-1.5">
                  <p className="text-sm text-muted-foreground">
                    No custom domain configured.
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    Configure a branded portal domain in Edit mode.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
