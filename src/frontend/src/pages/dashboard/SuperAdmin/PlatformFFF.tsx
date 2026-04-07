import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useActor } from "@caffeineai/core-infrastructure";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ExternalLink, GitBranch, Info, Layers } from "lucide-react";
import { toast } from "sonner";
import { createActor } from "../../../backend";
import type { FranchiseLink } from "../../../backend.d";

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString();
}

function FranchiseStatusBadge({ status }: { status: FranchiseLink["status"] }) {
  if (status === "pending")
    return (
      <Badge
        variant="outline"
        className="text-amber-400 border-amber-500/30 bg-amber-500/10"
      >
        Pending
      </Badge>
    );
  if (status === "active")
    return (
      <Badge
        variant="outline"
        className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      >
        Active
      </Badge>
    );
  return (
    <Badge
      variant="outline"
      className="text-red-400 border-red-500/30 bg-red-500/10"
    >
      Terminated
    </Badge>
  );
}

export default function PlatformFFF() {
  const { actor, isFetching } = useActor(createActor);
  const queryClient = useQueryClient();

  const { data: links, isLoading } = useQuery<FranchiseLink[]>({
    queryKey: ["platform-franchise-links"],
    queryFn: async () => {
      if (!actor) return [];
      const res = await (actor as any).getPlatformFranchiseLinks();
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
    enabled: !!actor && !isFetching,
  });

  const terminateMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!actor) throw new Error("Not ready");
      const res = await (actor as any).updateFranchiseLinkStatus(
        id,
        "terminated",
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["platform-franchise-links"],
      });
      toast.success("Franchise link terminated");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold">FFF Platform</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Platform-wide FinFracFran™ franchise relationship management.
        </p>
      </div>

      {/* Asset Summary Info Card */}
      <Card className="border-blue-500/20 bg-blue-500/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-md bg-blue-500/10 shrink-0 mt-0.5">
              <Layers className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="font-semibold text-sm">
                Asset Management is Org-Scoped
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Asset creation, ownership allocation, and revenue splits are
                managed at the organization level. Use the{" "}
                <strong>Organizations</strong> page to navigate to an org's
                FinFracFran™ dashboard.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Platform Franchise Overview */}
      <Card className="border-border/60">
        <CardHeader>
          <div className="flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">
              Platform Franchise Overview
            </CardTitle>
          </div>
          <CardDescription>
            All franchise relationships across the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="space-y-2 p-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : !links || links.length === 0 ? (
            <div
              className="text-center py-16 text-muted-foreground"
              data-ocid="platform_fff.franchise.empty_state"
            >
              <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No franchise links yet</p>
              <p className="text-sm mt-1">
                Franchise relationships created by org admins will appear here.
              </p>
            </div>
          ) : (
            <div
              className="overflow-x-auto"
              data-ocid="platform_fff.franchise.table"
            >
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Franchisor Org</TableHead>
                    <TableHead>Franchisee Org</TableHead>
                    <TableHead>Royalty %</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Terms</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {links.map((link, idx) => (
                    <TableRow
                      key={link.id}
                      data-ocid={`platform_fff.franchise.row.${idx + 1}`}
                    >
                      <TableCell className="font-mono text-xs max-w-[140px] truncate">
                        {link.franchisorOrgId}
                      </TableCell>
                      <TableCell className="font-mono text-xs max-w-[140px] truncate">
                        {link.franchiseeOrgId}
                      </TableCell>
                      <TableCell className="font-semibold">
                        {link.royaltyPct}%
                      </TableCell>
                      <TableCell>
                        <FranchiseStatusBadge status={link.status} />
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">
                        {formatDate(link.createdAt)}
                      </TableCell>
                      <TableCell>
                        {link.termsUrl ? (
                          <a
                            href={link.termsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-xs text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" />
                            View
                          </a>
                        ) : (
                          <span className="text-muted-foreground text-xs">
                            —
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {link.status !== "terminated" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-red-400 border-red-500/40 hover:bg-red-500/10"
                                data-ocid={`platform_fff.franchise.delete_button.${idx + 1}`}
                              >
                                Terminate
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>
                                  Terminate Franchise Link?
                                </AlertDialogTitle>
                                <AlertDialogDescription>
                                  This will permanently terminate the franchise
                                  relationship between these organizations. This
                                  action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel data-ocid="platform_fff.terminate.cancel_button">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground"
                                  onClick={() =>
                                    terminateMutation.mutate(link.id)
                                  }
                                  data-ocid="platform_fff.terminate.confirm_button"
                                >
                                  Terminate
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info note */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Info className="w-3.5 h-3.5 shrink-0" />
        <span>
          Only Super Admins can terminate franchise links from this view. Org
          Admins manage their own links from the Ownership & Franchising page.
        </span>
      </div>
    </div>
  );
}
