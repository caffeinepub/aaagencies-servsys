import type { Branch, BranchInput, BranchUpdateInput } from "@/backend.d";
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
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  GitBranch,
  Globe,
  Loader2,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Power,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";

type BranchFormState = {
  name: string;
  location: string;
  siteUrl: string;
  phone: string;
  timezone: string;
  primaryLanguage: string;
  subWalletEnabled: boolean;
};

const DEFAULT_FORM: BranchFormState = {
  name: "",
  location: "",
  siteUrl: "",
  phone: "",
  timezone: "",
  primaryLanguage: "en",
  subWalletEnabled: false,
};

export default function BranchesSites() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<BranchFormState>(DEFAULT_FORM);

  const [editBranch, setEditBranch] = useState<Branch | null>(null);
  const [editForm, setEditForm] = useState<BranchFormState>(DEFAULT_FORM);

  const [deactivateTarget, setDeactivateTarget] = useState<Branch | null>(null);

  // Fetch org first to get orgId
  const { data: org } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor && !isFetching,
  });

  // Fetch branches
  const { data: branches, isLoading: branchesLoading } = useQuery<Branch[]>({
    queryKey: ["branches", org?.id],
    queryFn: async () => {
      if (!actor || !org?.id) return [];
      return (actor as any).getBranchesByOrg(org.id);
    },
    enabled: !!actor && !!org?.id && !isFetching,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: async (form: BranchFormState) => {
      if (!actor || !org?.id) throw new Error("Not connected");
      const input: BranchInput = {
        orgId: org.id,
        name: form.name,
        location: form.location,
        siteUrl: form.siteUrl ? form.siteUrl : undefined,
        phone: form.phone ? form.phone : undefined,
        timezone: form.timezone,
        primaryLanguage: form.primaryLanguage,
        subWalletEnabled: form.subWalletEnabled,
        managerId: undefined,
      };
      const result = await (actor as any).createBranch(input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches", org?.id] });
      setCreateOpen(false);
      setCreateForm(DEFAULT_FORM);
      toast.success("Branch created successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Edit mutation
  const editMutation = useMutation({
    mutationFn: async ({ id, form }: { id: string; form: BranchFormState }) => {
      if (!actor) throw new Error("Not connected");
      const input: BranchUpdateInput = {
        name: form.name || undefined,
        location: form.location || undefined,
        siteUrl: form.siteUrl ? form.siteUrl : undefined,
        phone: form.phone ? form.phone : undefined,
        timezone: form.timezone || undefined,
        primaryLanguage: form.primaryLanguage || undefined,
        subWalletEnabled: form.subWalletEnabled,
      };
      const result = await (actor as any).updateBranch(id, input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches", org?.id] });
      setEditBranch(null);
      toast.success("Branch updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await (actor as any).deactivateBranch(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches", org?.id] });
      setDeactivateTarget(null);
      toast.success("Branch deactivated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setDeactivateTarget(null);
    },
  });

  const openEdit = (branch: Branch) => {
    setEditForm({
      name: branch.name,
      location: branch.location,
      siteUrl: branch.siteUrl ?? "",
      phone: branch.phone ?? "",
      timezone: branch.timezone,
      primaryLanguage: branch.primaryLanguage,
      subWalletEnabled: branch.subWalletEnabled,
    });
    setEditBranch(branch);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Branches &amp; Sites
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Remote offices and branch locations
          </p>
        </div>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="branch.open_modal_button">
              <Plus className="w-4 h-4 mr-1.5" />
              Add Branch
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="branch.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">Add Branch</DialogTitle>
            </DialogHeader>
            <BranchForm
              form={createForm}
              onChange={setCreateForm}
              onSubmit={() => createMutation.mutate(createForm)}
              isPending={createMutation.isPending}
              submitLabel="Create Branch"
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Loading state */}
      {branchesLoading && (
        <div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          data-ocid="branch.loading_state"
        >
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-52 w-full rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!branchesLoading && (!branches || branches.length === 0) && (
        <div
          className="flex flex-col items-center gap-3 py-16 text-center"
          data-ocid="branch.empty_state"
        >
          <div className="p-4 rounded-full bg-primary/10">
            <Building2 className="w-8 h-8 text-primary/60" />
          </div>
          <p className="text-muted-foreground text-sm">
            No branches yet. Add your first branch to get started.
          </p>
        </div>
      )}

      {/* Branch cards */}
      {!branchesLoading && branches && branches.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch, idx) => (
            <Card
              key={branch.id}
              className="border-border/60"
              data-ocid={`branch.item.${idx + 1}`}
            >
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="p-2 rounded-lg bg-primary/10">
                    <GitBranch className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        branch.isActive
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {branch.isActive ? "Active" : "Inactive"}
                    </Badge>
                    {branch.subWalletEnabled && (
                      <Badge
                        variant="outline"
                        className="text-xs bg-amber-500/10 text-amber-400 border-amber-500/30"
                      >
                        <Wallet className="w-2.5 h-2.5 mr-1" />
                        Sub-Wallet
                      </Badge>
                    )}
                  </div>
                </div>

                <h3 className="font-display font-semibold text-sm mb-2">
                  {branch.name}
                </h3>

                <div className="space-y-1.5 text-xs text-muted-foreground mb-3">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span>{branch.location}</span>
                  </div>
                  {branch.phone && (
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.siteUrl && (
                    <div className="flex items-center gap-1.5 text-primary">
                      <Globe className="w-3 h-3 shrink-0" />
                      <a
                        href={branch.siteUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="truncate hover:underline"
                      >
                        {branch.siteUrl}
                      </a>
                    </div>
                  )}
                  <div className="flex gap-3 pt-0.5">
                    <span>🕐 {branch.timezone}</span>
                    <span>🌐 {branch.primaryLanguage.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-7 text-xs"
                    data-ocid={`branch.edit_button.${idx + 1}`}
                    onClick={() => openEdit(branch)}
                  >
                    <Pencil className="w-3 h-3 mr-1" />
                    Edit
                  </Button>
                  {branch.isActive && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                      data-ocid={`branch.delete_button.${idx + 1}`}
                      onClick={() => setDeactivateTarget(branch)}
                    >
                      <Power className="w-3 h-3 mr-1" />
                      Deactivate
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog
        open={!!editBranch}
        onOpenChange={(open) => !open && setEditBranch(null)}
      >
        <DialogContent data-ocid="branch.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Edit Branch</DialogTitle>
          </DialogHeader>
          <BranchForm
            form={editForm}
            onChange={setEditForm}
            onSubmit={() =>
              editBranch &&
              editMutation.mutate({ id: editBranch.id, form: editForm })
            }
            isPending={editMutation.isPending}
            submitLabel="Save Changes"
          />
        </DialogContent>
      </Dialog>

      {/* Deactivate confirmation */}
      <AlertDialog
        open={!!deactivateTarget}
        onOpenChange={(open) => !open && setDeactivateTarget(null)}
      >
        <AlertDialogContent data-ocid="branch.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Deactivate Branch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will deactivate <strong>{deactivateTarget?.name}</strong>.
              The branch will no longer appear as active. You can reactivate it
              later.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="branch.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="branch.confirm_button"
              onClick={() =>
                deactivateTarget &&
                deactivateMutation.mutate(deactivateTarget.id)
              }
            >
              Deactivate
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Shared form component ─────────────────────────────────────────────────

interface BranchFormProps {
  form: BranchFormState;
  onChange: (form: BranchFormState) => void;
  onSubmit: () => void;
  isPending: boolean;
  submitLabel: string;
}

function BranchForm({
  form,
  onChange,
  onSubmit,
  isPending,
  submitLabel,
}: BranchFormProps) {
  const set = (key: keyof BranchFormState, value: string | boolean) =>
    onChange({ ...form, [key]: value });

  return (
    <div className="space-y-4 mt-2">
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2 col-span-2">
          <Label>Branch Name *</Label>
          <Input
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. APAC Office"
            data-ocid="branch.input"
          />
        </div>
        <div className="space-y-2 col-span-2">
          <Label>Location *</Label>
          <Input
            value={form.location}
            onChange={(e) => set("location", e.target.value)}
            placeholder="City, Country"
            data-ocid="branch.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Timezone *</Label>
          <Input
            value={form.timezone}
            onChange={(e) => set("timezone", e.target.value)}
            placeholder="e.g. America/New_York"
            data-ocid="branch.input"
          />
        </div>
        <div className="space-y-2">
          <Label>Primary Language *</Label>
          <Input
            value={form.primaryLanguage}
            onChange={(e) => set("primaryLanguage", e.target.value)}
            placeholder="e.g. en"
            data-ocid="branch.input"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Site URL{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            value={form.siteUrl}
            onChange={(e) => set("siteUrl", e.target.value)}
            placeholder="https://..."
            data-ocid="branch.input"
          />
        </div>
        <div className="space-y-2">
          <Label>
            Phone{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="+1 555 000 0000"
            data-ocid="branch.input"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Checkbox
          id="subwallet"
          checked={form.subWalletEnabled}
          onCheckedChange={(checked) =>
            set("subWalletEnabled", checked === true)
          }
          data-ocid="branch.checkbox"
        />
        <Label htmlFor="subwallet" className="cursor-pointer">
          Enable Sub-Wallet for this branch
        </Label>
      </div>

      <Button
        className="w-full"
        onClick={onSubmit}
        disabled={isPending || !form.name || !form.location || !form.timezone}
        data-ocid="branch.submit_button"
      >
        {isPending ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          submitLabel
        )}
      </Button>
    </div>
  );
}
