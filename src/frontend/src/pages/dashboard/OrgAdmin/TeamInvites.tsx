import { RoleBadge } from "@/components/RoleBadge";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Ban,
  Copy,
  Link2,
  Loader2,
  Plus,
  UserX,
  Users,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { User } from "../../../backend.d";

interface InviteLink {
  id: string;
  code: string;
  orgId?: string[];
  createdBy: unknown;
  role: string;
  maxRedemptions?: bigint[];
  redemptionCount: bigint;
  expiresAt?: bigint[];
  isActive: boolean;
  createdAt: bigint;
}

export default function TeamInvites() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    role: "team_member",
    maxRedemptions: "",
    expiresAt: "",
  });

  // Change role dialog state
  const [changeRoleUser, setChangeRoleUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState("team_member");

  // Remove member confirmation state
  const [removeTarget, setRemoveTarget] = useState<User | null>(null);

  // Fetch org to get orgId
  const { data: org } = useQuery({
    queryKey: ["my-org"],
    queryFn: () => actor!.getMyOrganization(),
    enabled: !!actor && !isFetching,
  });

  // Fetch real team members
  const { data: teamMembers, isLoading: membersLoading } = useQuery<User[]>({
    queryKey: ["team-members", org?.id],
    queryFn: async () => {
      if (!actor || !org?.id) return [];
      return (actor as any).getTeamMembersByOrg(org.id);
    },
    enabled: !!actor && !!org?.id && !isFetching,
  });

  // Load invite links from backend
  const {
    data: inviteLinks,
    isLoading: linksLoading,
    isError: linksError,
  } = useQuery<InviteLink[]>({
    queryKey: ["myInviteLinks"],
    queryFn: async () => {
      if (!actor) return [];
      const result = await (actor as any).getMyInviteLinks();
      return result as InviteLink[];
    },
    enabled: !!actor && !isFetching,
  });

  // Create invite link mutation
  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not connected");
      const input: {
        role: { [key: string]: null };
        maxRedemptions: bigint[] | [];
        expiresAt: bigint[] | [];
        orgId: string[] | [];
      } = {
        role: { [form.role]: null } as { [key: string]: null },
        maxRedemptions: form.maxRedemptions
          ? [BigInt(form.maxRedemptions)]
          : [],
        expiresAt: form.expiresAt
          ? [BigInt(new Date(form.expiresAt).getTime()) * 1_000_000n]
          : [],
        orgId: [],
      };
      const result = await (actor as any).createInviteLink(input);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInviteLinks"] });
      setOpen(false);
      setForm({ role: "team_member", maxRedemptions: "", expiresAt: "" });
      toast.success("Invite link created");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Deactivate invite link mutation
  const deactivateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not connected");
      const result = await (actor as any).deactivateInviteLink(id);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["myInviteLinks"] });
      toast.success("Invite link deactivated");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({
      principal,
      role,
    }: {
      principal: unknown;
      role: string;
    }) => {
      if (!actor) throw new Error("Not connected");
      const roleArg = { [role]: null } as any;
      const result = await (actor as any).updateUserRole(principal, roleArg);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", org?.id] });
      setChangeRoleUser(null);
      toast.success("Role updated successfully");
    },
    onError: (err: Error) => {
      toast.error(err.message);
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (principal: unknown) => {
      if (!actor) throw new Error("Not connected");
      const result = await (actor as any).removeUserFromOrg(principal);
      if (result.__kind__ === "err") throw new Error(result.err);
      return result.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", org?.id] });
      setRemoveTarget(null);
      toast.success("Member removed from organization");
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setRemoveTarget(null);
    },
  });

  const formatExpiry = (link: InviteLink) => {
    const expiresAt = link.expiresAt;
    if (expiresAt && Array.isArray(expiresAt) && expiresAt.length > 0) {
      return new Date(Number(expiresAt[0]) / 1_000_000).toLocaleDateString();
    }
    return "No expiry";
  };

  const formatRedemptions = (link: InviteLink) => {
    const max = link.maxRedemptions;
    const maxVal =
      max && Array.isArray(max) && max.length > 0 ? Number(max[0]) : null;
    return `${Number(link.redemptionCount)}/${maxVal !== null ? maxVal : "\u221e"} used`;
  };

  const getRoleName = (role: unknown): string => {
    if (typeof role === "object" && role !== null) {
      const key = Object.keys(role as object)[0];
      return key ?? "unknown";
    }
    if (typeof role === "string") return role;
    return "unknown";
  };

  const getUserRoleName = (user: User): string => {
    return getRoleName(user.role);
  };

  const memberCount = Array.isArray(teamMembers) ? teamMembers.length : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Team &amp; Invites
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage team members and invite new users
          </p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="invite.open_modal_button">
              <Plus className="w-4 h-4 mr-1.5" />
              Invite Member
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="invite.dialog">
            <DialogHeader>
              <DialogTitle className="font-display">
                Create Invite Link
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-2">
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  value={form.role}
                  onValueChange={(v) => setForm((f) => ({ ...f, role: v }))}
                >
                  <SelectTrigger data-ocid="invite.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="team_member">Team Member</SelectItem>
                    <SelectItem value="org_admin">Org Admin</SelectItem>
                    <SelectItem value="end_customer">End Customer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  Max Redemptions{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  type="number"
                  value={form.maxRedemptions}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, maxRedemptions: e.target.value }))
                  }
                  placeholder="Leave blank for unlimited"
                  data-ocid="invite.input"
                />
              </div>
              <div className="space-y-2">
                <Label>
                  Expiry Date{" "}
                  <span className="text-muted-foreground font-normal">
                    (optional)
                  </span>
                </Label>
                <Input
                  type="date"
                  value={form.expiresAt}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, expiresAt: e.target.value }))
                  }
                  data-ocid="invite.input"
                />
              </div>
              <Button
                className="w-full"
                data-ocid="invite.submit_button"
                disabled={createMutation.isPending}
                onClick={() => createMutation.mutate()}
              >
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  "Generate Invite Link"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Team members */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" /> Team Members (
            {memberCount})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {membersLoading && (
            <div className="space-y-3 px-5 py-3" data-ocid="team.loading_state">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          )}

          {!membersLoading && (!teamMembers || teamMembers.length === 0) && (
            <div
              className="flex flex-col items-center gap-2 px-5 py-8 text-center"
              data-ocid="team.empty_state"
            >
              <Users className="w-8 h-8 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">
                No team members yet. Invite members using the button above.
              </p>
            </div>
          )}

          {!membersLoading && teamMembers && teamMembers.length > 0 && (
            <div className="divide-y divide-border/40">
              {teamMembers.map((user, idx) => {
                const initials = (user.displayName || "?")
                  .split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .toUpperCase()
                  .slice(0, 2);
                const roleName = getUserRoleName(user);
                return (
                  <div
                    key={String(user.principal)}
                    className="flex items-center gap-3 px-5 py-2.5"
                    data-ocid={`team.item.${idx + 1}`}
                  >
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/15 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{user.displayName}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                    <RoleBadge role={roleName} />
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        user.isActive
                          ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs px-2"
                        data-ocid={`team.edit_button.${idx + 1}`}
                        onClick={() => {
                          setNewRole(roleName);
                          setChangeRoleUser(user);
                        }}
                      >
                        Change Role
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        data-ocid={`team.delete_button.${idx + 1}`}
                        onClick={() => setRemoveTarget(user)}
                      >
                        <UserX className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Invite links */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Invite Links
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {linksLoading && (
            <div
              className="space-y-3 px-5 py-3"
              data-ocid="invite.loading_state"
            >
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-3/4" />
            </div>
          )}
          {linksError && (
            <div
              className="flex items-center gap-2 px-5 py-4 text-destructive text-sm"
              data-ocid="invite.error_state"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Failed to load invite links. Please try again.</span>
            </div>
          )}
          {!linksLoading &&
            !linksError &&
            (!inviteLinks || inviteLinks.length === 0) && (
              <div
                className="flex flex-col items-center gap-2 px-5 py-8 text-center"
                data-ocid="invite.empty_state"
              >
                <Link2 className="w-8 h-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                  No invite links yet. Create one to invite team members.
                </p>
              </div>
            )}
          {!linksLoading && inviteLinks && inviteLinks.length > 0 && (
            <div className="divide-y divide-border/40">
              {inviteLinks.map((link, idx) => {
                const roleName = getRoleName(link.role);
                const inviteUrl = `${window.location.origin}/invite/${link.code}`;
                return (
                  <div
                    key={link.id}
                    className="flex items-center gap-3 px-5 py-3"
                    data-ocid={`invite.item.${idx + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <code className="text-xs font-mono bg-muted/50 px-1.5 py-0.5 rounded text-muted-foreground max-w-[140px] truncate block">
                          {link.code}
                        </code>
                        <RoleBadge role={roleName} />
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            link.isActive
                              ? "bg-teal-500/10 text-teal-400 border-teal-500/30"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {link.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatRedemptions(link)} &bull; {formatExpiry(link)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="w-7 h-7"
                        data-ocid={`invite.secondary_button.${idx + 1}`}
                        onClick={() => {
                          navigator.clipboard.writeText(inviteUrl);
                          toast.success("Invite link copied");
                        }}
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </Button>
                      {link.isActive && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="w-7 h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                          data-ocid={`invite.delete_button.${idx + 1}`}
                          disabled={
                            deactivateMutation.isPending &&
                            deactivateMutation.variables === link.id
                          }
                          onClick={() => deactivateMutation.mutate(link.id)}
                        >
                          {deactivateMutation.isPending &&
                          deactivateMutation.variables === link.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <Ban className="w-3.5 h-3.5" />
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Role Dialog */}
      <Dialog
        open={!!changeRoleUser}
        onOpenChange={(open) => !open && setChangeRoleUser(null)}
      >
        <DialogContent data-ocid="team.dialog">
          <DialogHeader>
            <DialogTitle className="font-display">Change Role</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-2">
            <p className="text-sm text-muted-foreground">
              Update the role for <strong>{changeRoleUser?.displayName}</strong>
              .
            </p>
            <div className="space-y-2">
              <Label>New Role</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger data-ocid="team.select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="team_member">Team Member</SelectItem>
                  <SelectItem value="org_admin">Org Admin</SelectItem>
                  <SelectItem value="end_customer">End Customer</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={updateRoleMutation.isPending}
                data-ocid="team.confirm_button"
                onClick={() =>
                  changeRoleUser &&
                  updateRoleMutation.mutate({
                    principal: changeRoleUser.principal,
                    role: newRole,
                  })
                }
              >
                {updateRoleMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Role"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setChangeRoleUser(null)}
                data-ocid="team.cancel_button"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Remove Member Confirmation */}
      <AlertDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
      >
        <AlertDialogContent data-ocid="team.dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Team Member?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove <strong>{removeTarget?.displayName}</strong> from
              your organization. They will lose access to all org resources.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-ocid="team.cancel_button">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-ocid="team.confirm_button"
              onClick={() =>
                removeTarget &&
                removeMemberMutation.mutate(removeTarget.principal)
              }
            >
              {removeMemberMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                "Remove Member"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
