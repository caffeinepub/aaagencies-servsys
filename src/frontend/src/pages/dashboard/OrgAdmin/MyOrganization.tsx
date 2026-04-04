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
import { useQuery } from "@tanstack/react-query";
import { Building2, Languages, Pencil } from "lucide-react";
import { useState } from "react";
import type { Organization } from "../../../backend.d";

type DisplayOrg = {
  name: string;
  description: string;
  isActive: boolean;
  primaryLanguage: string;
  supportedLanguages: string[];
  planTier: string;
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
  };
}

export default function MyOrganization() {
  const { actor } = useActor();
  const [editing, setEditing] = useState(false);

  const { data: org, isLoading } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor,
  });

  const displayOrg = toDisplayOrg(org);

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
          onClick={() => setEditing(!editing)}
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
            <div className="space-y-2">
              <Label>Name</Label>
              <Input defaultValue={displayOrg.name} />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Input defaultValue={displayOrg.description} />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => setEditing(false)}>
                Save Changes
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setEditing(false)}
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
