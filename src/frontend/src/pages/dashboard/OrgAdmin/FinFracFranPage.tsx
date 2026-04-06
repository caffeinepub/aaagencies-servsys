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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useActor } from "@/hooks/useActor";
import type { Principal } from "@icp-sdk/core/principal";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Briefcase,
  Building2,
  ChevronDown,
  ChevronUp,
  DollarSign,
  ExternalLink,
  GitBranch,
  Layers,
  Lightbulb,
  Loader2,
  PieChart as PieChartIcon,
  Plus,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  Tooltip as RechartTooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "sonner";
import type {
  FFFAssetType,
  FractionalAsset,
  FractionalOwnership,
  FranchiseLink,
  RevenueSplit,
  RevenueSplitEntryInput,
  User,
} from "../../../backend.d";

interface FinFracFranPageProps {
  user: User;
}

const ASSET_TYPE_CONFIG: Record<
  FFFAssetType,
  { label: string; color: string; icon: React.ElementType }
> = {
  realEstate: {
    label: "Real Estate",
    color: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    icon: Building2,
  },
  business: {
    label: "Business",
    color: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    icon: Briefcase,
  },
  intellectualProperty: {
    label: "IP",
    color: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    icon: Lightbulb,
  },
  revenueStream: {
    label: "Revenue Stream",
    color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    icon: TrendingUp,
  },
  custom: {
    label: "Custom",
    color: "bg-muted text-muted-foreground border-border",
    icon: Layers,
  },
};

const PIE_COLORS = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a855f7",
  "#3b82f6",
  "#84cc16",
];

function formatUsd(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatDate(ts: bigint) {
  return new Date(Number(ts / 1_000_000n)).toLocaleDateString();
}

// ─── Assets Tab ─────────────────────────────────────────────────────────────

function AssetsTab({ user }: { user: User }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const orgId = typeof user.orgId === "string" ? user.orgId : undefined;

  const [expanded, setExpanded] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<FractionalAsset | null>(null);

  // Create form state
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newType, setNewType] = useState<FFFAssetType>("business");
  const [newShares, setNewShares] = useState("");
  const [newValuation, setNewValuation] = useState("");

  // Edit form state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editValuation, setEditValuation] = useState("");
  const [editActive, setEditActive] = useState(true);

  const { data: assets, isLoading } = useQuery<FractionalAsset[]>({
    queryKey: ["fractional-assets", orgId],
    queryFn: async () => {
      if (!actor || !orgId) return [];
      const res = await (actor as any).getFractionalAssets(orgId);
      if (res.__kind__ === "ok") return res.ok;
      throw new Error(res.err);
    },
    enabled: !!actor && !isFetching && !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !orgId) throw new Error("Not ready");
      const res = await (actor as any).createFractionalAsset({
        orgId,
        name: newName,
        description: newDesc,
        assetType: newType,
        totalShares: Number(newShares),
        valuationUsd: Number(newValuation),
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fractional-assets", orgId] });
      toast.success("Asset created successfully");
      setCreateOpen(false);
      setNewName("");
      setNewDesc("");
      setNewType("business");
      setNewShares("");
      setNewValuation("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !editAsset) throw new Error("Not ready");
      const res = await (actor as any).updateFractionalAsset(editAsset.id, {
        name: editName || undefined,
        description: editDesc || undefined,
        valuationUsd: editValuation ? Number(editValuation) : undefined,
        isActive: editActive,
      });
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fractional-assets", orgId] });
      toast.success("Asset updated");
      setEditOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const openEdit = (asset: FractionalAsset) => {
    setEditAsset(asset);
    setEditName(asset.name);
    setEditDesc(asset.description);
    setEditValuation(String(asset.valuationUsd));
    setEditActive(asset.isActive);
    setEditOpen(true);
  };

  if (!orgId) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        No organization linked to your account.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage fractional ownership assets for your organization.
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="fff.assets.open_modal_button">
              <Plus className="w-4 h-4 mr-1.5" />
              New Asset
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="fff.create_asset.dialog">
            <DialogHeader>
              <DialogTitle>Create Fractional Asset</DialogTitle>
              <DialogDescription>
                Define a new asset available for fractional ownership.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label htmlFor="asset-name">Asset Name</Label>
                <Input
                  id="asset-name"
                  placeholder="Downtown Office Tower"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  data-ocid="fff.create_asset.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="asset-desc">Description</Label>
                <Input
                  id="asset-desc"
                  placeholder="Brief description..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label>Asset Type</Label>
                <Select
                  value={newType}
                  onValueChange={(v) => setNewType(v as FFFAssetType)}
                >
                  <SelectTrigger data-ocid="fff.create_asset.select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ASSET_TYPE_CONFIG) as FFFAssetType[]).map(
                      (t) => (
                        <SelectItem key={t} value={t}>
                          {ASSET_TYPE_CONFIG[t].label}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label htmlFor="total-shares">Total Shares</Label>
                  <Input
                    id="total-shares"
                    type="number"
                    min="1"
                    placeholder="1000"
                    value={newShares}
                    onChange={(e) => setNewShares(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="valuation">Valuation (USD)</Label>
                  <Input
                    id="valuation"
                    type="number"
                    min="0"
                    placeholder="500000"
                    value={newValuation}
                    onChange={(e) => setNewValuation(e.target.value)}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                data-ocid="fff.create_asset.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending ||
                  !newName ||
                  !newShares ||
                  !newValuation
                }
                data-ocid="fff.create_asset.submit_button"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Create Asset
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-lg" />
          ))}
        </div>
      ) : !assets || assets.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fff.assets.empty_state"
        >
          <Layers className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No assets yet</p>
          <p className="text-sm mt-1">
            Create your first fractional asset to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="fff.assets.list">
          {assets.map((asset, idx) => {
            const cfg = ASSET_TYPE_CONFIG[asset.assetType];
            const Icon = cfg.icon;
            const isExpanded = expanded === asset.id;
            return (
              <Card
                key={asset.id}
                className="border-border/60"
                data-ocid={`fff.asset.item.${idx + 1}`}
              >
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="p-1.5 rounded-md bg-card border border-border/60">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm">
                            {asset.name}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-xs ${cfg.color}`}
                          >
                            {cfg.label}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={
                              asset.isActive
                                ? "text-xs text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
                                : "text-xs text-muted-foreground"
                            }
                          >
                            {asset.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-muted-foreground">
                            {asset.totalShares.toLocaleString()} shares
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ·
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatUsd(asset.valuationUsd)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setExpanded(isExpanded ? null : asset.id)}
                      className="text-muted-foreground hover:text-foreground shrink-0"
                      aria-label={isExpanded ? "Collapse" : "Expand"}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </CardHeader>
                {isExpanded && (
                  <CardContent className="pt-0 px-4 pb-4 space-y-3">
                    <div className="border-t border-border/40 pt-3">
                      <p className="text-sm text-muted-foreground">
                        {asset.description || "No description provided."}
                      </p>
                      <div className="grid grid-cols-2 gap-4 mt-3">
                        <div>
                          <p className="text-xs text-muted-foreground">ID</p>
                          <p className="text-xs font-mono text-foreground truncate">
                            {asset.id}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Created
                          </p>
                          <p className="text-xs text-foreground">
                            {formatDate(asset.createdAt)}
                          </p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="mt-3"
                        onClick={() => openEdit(asset)}
                        data-ocid={`fff.asset.edit_button.${idx + 1}`}
                      >
                        Edit Asset
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent data-ocid="fff.edit_asset.dialog">
          <DialogHeader>
            <DialogTitle>Edit Asset</DialogTitle>
            <DialogDescription>
              Update the asset details below.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                data-ocid="fff.edit_asset.input"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Description</Label>
              <Input
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Valuation (USD)</Label>
              <Input
                type="number"
                value={editValuation}
                onChange={(e) => setEditValuation(e.target.value)}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={editActive}
                onCheckedChange={setEditActive}
                data-ocid="fff.edit_asset.switch"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditOpen(false)}
              data-ocid="fff.edit_asset.cancel_button"
            >
              Cancel
            </Button>
            <Button
              onClick={() => updateMutation.mutate()}
              disabled={updateMutation.isPending}
              data-ocid="fff.edit_asset.save_button"
            >
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Ownership Tab ───────────────────────────────────────────────────────────

function OwnershipTab({ user }: { user: User }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const orgId = typeof user.orgId === "string" ? user.orgId : undefined;

  const [selectedAssetId, setSelectedAssetId] = useState<string>("");
  const [issueOpen, setIssueOpen] = useState(false);
  const [issueUserId, setIssueUserId] = useState("");
  const [issueUserName, setIssueUserName] = useState("");
  const [issueShares, setIssueShares] = useState("");

  const { data: assets } = useQuery<FractionalAsset[]>({
    queryKey: ["fractional-assets", orgId],
    queryFn: async () => {
      if (!actor || !orgId) return [];
      const res = await (actor as any).getFractionalAssets(orgId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!orgId,
  });

  const { data: ownership, isLoading: ownershipLoading } = useQuery<
    FractionalOwnership[]
  >({
    queryKey: ["ownership-by-asset", selectedAssetId],
    queryFn: async () => {
      if (!actor || !selectedAssetId) return [];
      const res = await (actor as any).getOwnershipByAsset(selectedAssetId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!selectedAssetId,
  });

  const selectedAsset = assets?.find((a) => a.id === selectedAssetId);
  const totalShares = selectedAsset?.totalShares ?? 0;

  const issueMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedAssetId) throw new Error("Select an asset first");
      const res = await (actor as any).issueShares(
        selectedAssetId,
        issueUserId as unknown as Principal,
        Number(issueShares),
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ownership-by-asset", selectedAssetId],
      });
      toast.success("Shares issued successfully");
      setIssueOpen(false);
      setIssueUserId("");
      setIssueUserName("");
      setIssueShares("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const pieData = (ownership ?? []).map((o, i) => ({
    name: o.userName,
    value: o.shares,
    fill: PIE_COLORS[i % PIE_COLORS.length],
  }));

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
          <SelectTrigger
            className="w-full sm:w-72"
            data-ocid="fff.ownership.select"
          >
            <SelectValue placeholder="Select an asset to view ownership" />
          </SelectTrigger>
          <SelectContent>
            {(assets ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAssetId && (
          <Dialog open={issueOpen} onOpenChange={setIssueOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-ocid="fff.ownership.open_modal_button">
                <Plus className="w-4 h-4 mr-1.5" />
                Issue Shares
              </Button>
            </DialogTrigger>
            <DialogContent data-ocid="fff.issue_shares.dialog">
              <DialogHeader>
                <DialogTitle>Issue Shares</DialogTitle>
                <DialogDescription>
                  Allocate fractional ownership shares to a user.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>User Principal ID</Label>
                  <Input
                    placeholder="aaaaa-bbbbb-..."
                    value={issueUserId}
                    onChange={(e) => setIssueUserId(e.target.value)}
                    data-ocid="fff.issue_shares.input"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>User Name</Label>
                  <Input
                    placeholder="Jane Smith"
                    value={issueUserName}
                    onChange={(e) => setIssueUserName(e.target.value)}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Number of Shares</Label>
                  <Input
                    type="number"
                    min="1"
                    placeholder="100"
                    value={issueShares}
                    onChange={(e) => setIssueShares(e.target.value)}
                  />
                  {selectedAsset && (
                    <p className="text-xs text-muted-foreground">
                      Max available:{" "}
                      {selectedAsset.totalShares.toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIssueOpen(false)}
                  data-ocid="fff.issue_shares.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => issueMutation.mutate()}
                  disabled={
                    issueMutation.isPending || !issueUserId || !issueShares
                  }
                  data-ocid="fff.issue_shares.submit_button"
                >
                  {issueMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : null}
                  Issue Shares
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedAssetId ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fff.ownership.empty_state"
        >
          <PieChartIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select an asset</p>
          <p className="text-sm mt-1">
            Choose an asset above to view its ownership distribution.
          </p>
        </div>
      ) : ownershipLoading ? (
        <Skeleton className="h-40 w-full rounded-lg" />
      ) : !ownership || ownership.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fff.ownership.no_data_state"
        >
          <PieChartIcon className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No ownership records</p>
          <p className="text-sm mt-1">
            Issue shares to start tracking ownership.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Donut chart */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Ownership Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={2}
                    dataKey="value"
                  >
                    {pieData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                  <RechartTooltip
                    formatter={(value: number) => [
                      `${value.toLocaleString()} shares`,
                      "Shares",
                    ]}
                    contentStyle={{
                      background: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))",
                    }}
                  />
                  <Legend
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">
                        {value}
                      </span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Table */}
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold">
                Ownership Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Owner</TableHead>
                    <TableHead className="text-right">Shares</TableHead>
                    <TableHead className="text-right">%</TableHead>
                    <TableHead>Issued</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ownership.map((o, idx) => (
                    <TableRow
                      key={o.id}
                      data-ocid={`fff.ownership.row.${idx + 1}`}
                    >
                      <TableCell className="font-medium text-sm">
                        {o.userName}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {o.shares.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {totalShares > 0
                          ? ((o.shares / totalShares) * 100).toFixed(1)
                          : 0}
                        %
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(o.issuedAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// ─── Revenue Splits Tab ──────────────────────────────────────────────────────

function RevenueSplitsTab({ user }: { user: User }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const orgId = typeof user.orgId === "string" ? user.orgId : undefined;

  const [selectedAssetId, setSelectedAssetId] = useState("");
  const [createOpen, setCreateOpen] = useState(false);
  const [totalAmount, setTotalAmount] = useState("");
  const [rows, setRows] = useState<
    { userId: string; userName: string; shares: string; amountUsd: string }[]
  >([{ userId: "", userName: "", shares: "", amountUsd: "" }]);

  const { data: assets } = useQuery<FractionalAsset[]>({
    queryKey: ["fractional-assets", orgId],
    queryFn: async () => {
      if (!actor || !orgId) return [];
      const res = await (actor as any).getFractionalAssets(orgId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!orgId,
  });

  const { data: splits, isLoading } = useQuery<RevenueSplit[]>({
    queryKey: ["revenue-splits", selectedAssetId],
    queryFn: async () => {
      if (!actor || !selectedAssetId) return [];
      const res = await (actor as any).getRevenueSplits(selectedAssetId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!selectedAssetId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor || !selectedAssetId) throw new Error("Select an asset");
      const distribution: RevenueSplitEntryInput[] = rows
        .filter((r) => r.userId && r.userName)
        .map((r) => ({
          userId: r.userId as unknown as Principal,
          userName: r.userName,
          shares: Number(r.shares) || 0,
          amountUsd: Number(r.amountUsd) || 0,
        }));
      const res = await (actor as any).createRevenueSplit(
        selectedAssetId,
        Number(totalAmount),
        distribution,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["revenue-splits", selectedAssetId],
      });
      toast.success("Revenue split created");
      setCreateOpen(false);
      setTotalAmount("");
      setRows([{ userId: "", userName: "", shares: "", amountUsd: "" }]);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const distributeMutation = useMutation({
    mutationFn: async (splitId: string) => {
      if (!actor) throw new Error("Not ready");
      const res = await (actor as any).distributeRevenueSplit(splitId);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["revenue-splits", selectedAssetId],
      });
      toast.success("Revenue distributed successfully");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusBadge = (status: RevenueSplit["status"]) => {
    if (status === "pending")
      return (
        <Badge
          variant="outline"
          className="text-amber-400 border-amber-500/30 bg-amber-500/10"
        >
          Pending
        </Badge>
      );
    if (status === "distributed")
      return (
        <Badge
          variant="outline"
          className="text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
        >
          Distributed
        </Badge>
      );
    return (
      <Badge
        variant="outline"
        className="text-red-400 border-red-500/30 bg-red-500/10"
      >
        Cancelled
      </Badge>
    );
  };

  const updateRow = (idx: number, field: string, val: string) => {
    setRows((prev) =>
      prev.map((r, i) => (i === idx ? { ...r, [field]: val } : r)),
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
        <Select value={selectedAssetId} onValueChange={setSelectedAssetId}>
          <SelectTrigger
            className="w-full sm:w-72"
            data-ocid="fff.splits.select"
          >
            <SelectValue placeholder="Select an asset" />
          </SelectTrigger>
          <SelectContent>
            {(assets ?? []).map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedAssetId && (
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button size="sm" data-ocid="fff.splits.open_modal_button">
                <Plus className="w-4 h-4 mr-1.5" />
                New Split
              </Button>
            </DialogTrigger>
            <DialogContent
              className="max-w-2xl"
              data-ocid="fff.create_split.dialog"
            >
              <DialogHeader>
                <DialogTitle>Create Revenue Split</DialogTitle>
                <DialogDescription>
                  Define how revenue will be distributed among stakeholders.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label>Total Amount (USD)</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(e.target.value)}
                    data-ocid="fff.create_split.input"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Distribution</Label>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setRows((prev) => [
                          ...prev,
                          {
                            userId: "",
                            userName: "",
                            shares: "",
                            amountUsd: "",
                          },
                        ])
                      }
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Add Row
                    </Button>
                  </div>
                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {rows.map((row, i) => (
                      <div
                        key={`row-${i}-${row.userId}`}
                        className="grid grid-cols-4 gap-2"
                      >
                        <Input
                          placeholder="Principal ID"
                          value={row.userId}
                          onChange={(e) =>
                            updateRow(i, "userId", e.target.value)
                          }
                          className="col-span-1"
                        />
                        <Input
                          placeholder="Name"
                          value={row.userName}
                          onChange={(e) =>
                            updateRow(i, "userName", e.target.value)
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Shares"
                          value={row.shares}
                          onChange={(e) =>
                            updateRow(i, "shares", e.target.value)
                          }
                        />
                        <Input
                          type="number"
                          placeholder="Amount $"
                          value={row.amountUsd}
                          onChange={(e) =>
                            updateRow(i, "amountUsd", e.target.value)
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setCreateOpen(false)}
                  data-ocid="fff.create_split.cancel_button"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => createMutation.mutate()}
                  disabled={createMutation.isPending || !totalAmount}
                  data-ocid="fff.create_split.submit_button"
                >
                  {createMutation.isPending ? (
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  ) : null}
                  Create Split
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {!selectedAssetId ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fff.splits.empty_state"
        >
          <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Select an asset</p>
          <p className="text-sm mt-1">
            Choose an asset to view its revenue splits.
          </p>
        </div>
      ) : isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : !splits || splits.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fff.splits.no_data_state"
        >
          <DollarSign className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No revenue splits</p>
          <p className="text-sm mt-1">Create a split to distribute earnings.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {splits.map((split, idx) => (
            <Card
              key={split.id}
              className="border-border/60"
              data-ocid={`fff.split.item.${idx + 1}`}
            >
              <CardContent className="pt-4 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusBadge(split.status)}
                      <span className="font-semibold text-sm">
                        {formatUsd(split.totalAmountUsd)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        · {split.distribution.length} recipients
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Created {formatDate(split.createdAt)}
                      {split.distributedAt
                        ? ` · Distributed ${formatDate(split.distributedAt)}`
                        : ""}
                    </p>
                  </div>
                  {split.status === "pending" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          className="shrink-0 text-emerald-400 border-emerald-500/40 hover:bg-emerald-500/10"
                          data-ocid={`fff.split.distribute_button.${idx + 1}`}
                        >
                          Distribute
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Distribute Revenue?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            This will distribute{" "}
                            {formatUsd(split.totalAmountUsd)} to{" "}
                            {split.distribution.length} recipients. This action
                            cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel data-ocid="fff.distribute.cancel_button">
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => distributeMutation.mutate(split.id)}
                            data-ocid="fff.distribute.confirm_button"
                          >
                            Confirm Distribution
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
                {split.distribution.length > 0 && (
                  <div className="mt-3 border-t border-border/40 pt-3">
                    <p className="text-xs text-muted-foreground mb-2">
                      Distribution breakdown:
                    </p>
                    <div className="space-y-1">
                      {split.distribution.map((d, di) => (
                        <div
                          key={`dist-${d.userName}-${di}`}
                          className="flex items-center justify-between text-xs"
                        >
                          <span className="text-foreground">{d.userName}</span>
                          <span className="text-muted-foreground">
                            {d.shares.toLocaleString()} shares ·{" "}
                            {formatUsd(d.amountUsd)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Franchise Links Tab ─────────────────────────────────────────────────────

function FranchiseLinksTab({ user }: { user: User }) {
  const { actor, isFetching } = useActor();
  const queryClient = useQueryClient();
  const orgId = typeof user.orgId === "string" ? user.orgId : undefined;

  const [createOpen, setCreateOpen] = useState(false);
  const [franchisorId, setFranchisorId] = useState(orgId ?? "");
  const [franchiseeId, setFranchiseeId] = useState("");
  const [royalty, setRoyalty] = useState([10]);
  const [termsUrl, setTermsUrl] = useState("");

  const { data: links, isLoading } = useQuery<FranchiseLink[]>({
    queryKey: ["franchise-links", orgId],
    queryFn: async () => {
      if (!actor || !orgId) return [];
      const res = await (actor as any).getFranchiseLinks(orgId);
      if (res.__kind__ === "ok") return res.ok;
      return [];
    },
    enabled: !!actor && !isFetching && !!orgId,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error("Not ready");
      const res = await (actor as any).createFranchiseLink(
        franchisorId,
        franchiseeId,
        royalty[0],
        termsUrl || undefined,
      );
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["franchise-links", orgId] });
      toast.success("Franchise link created");
      setCreateOpen(false);
      setFranchiseeId("");
      setRoyalty([10]);
      setTermsUrl("");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({
      id,
      status,
    }: {
      id: string;
      status: "pending" | "active" | "terminated";
    }) => {
      if (!actor) throw new Error("Not ready");
      const res = await (actor as any).updateFranchiseLinkStatus(id, status);
      if (res.__kind__ === "err") throw new Error(res.err);
      return res.ok;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ["franchise-links", orgId] });
      toast.success(
        vars.status === "active"
          ? "Franchise link activated"
          : "Franchise link terminated",
      );
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const statusBadge = (status: FranchiseLink["status"]) => {
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
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Manage franchise relationships for your organization.
        </p>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button size="sm" data-ocid="fff.franchise.open_modal_button">
              <Plus className="w-4 h-4 mr-1.5" />
              New Link
            </Button>
          </DialogTrigger>
          <DialogContent data-ocid="fff.create_franchise.dialog">
            <DialogHeader>
              <DialogTitle>Create Franchise Link</DialogTitle>
              <DialogDescription>
                Establish a franchise relationship between two organizations.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-1.5">
                <Label>Franchisor Org ID</Label>
                <Input
                  value={franchisorId}
                  onChange={(e) => setFranchisorId(e.target.value)}
                  data-ocid="fff.create_franchise.input"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Franchisee Org ID</Label>
                <Input
                  placeholder="org-id-..."
                  value={franchiseeId}
                  onChange={(e) => setFranchiseeId(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Royalty %</Label>
                  <span className="text-sm font-semibold text-primary">
                    {royalty[0]}%
                  </span>
                </div>
                <Slider
                  value={royalty}
                  onValueChange={setRoyalty}
                  min={0}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Terms URL (optional)</Label>
                <Input
                  placeholder="https://..."
                  value={termsUrl}
                  onChange={(e) => setTermsUrl(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCreateOpen(false)}
                data-ocid="fff.create_franchise.cancel_button"
              >
                Cancel
              </Button>
              <Button
                onClick={() => createMutation.mutate()}
                disabled={
                  createMutation.isPending || !franchisorId || !franchiseeId
                }
                data-ocid="fff.create_franchise.submit_button"
              >
                {createMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                ) : null}
                Create Link
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      ) : !links || links.length === 0 ? (
        <div
          className="text-center py-16 text-muted-foreground"
          data-ocid="fff.franchise.empty_state"
        >
          <GitBranch className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="font-medium">No franchise links</p>
          <p className="text-sm mt-1">
            Create a franchise link to establish relationships.
          </p>
        </div>
      ) : (
        <div className="space-y-3" data-ocid="fff.franchise.list">
          {links.map((link, idx) => {
            const isFranchisor = link.franchisorOrgId === orgId;
            return (
              <Card
                key={link.id}
                className="border-border/60"
                data-ocid={`fff.franchise.item.${idx + 1}`}
              >
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        {statusBadge(link.status)}
                        <Badge
                          variant="outline"
                          className={
                            isFranchisor
                              ? "text-indigo-400 border-indigo-500/30 bg-indigo-500/10"
                              : "text-cyan-400 border-cyan-500/30 bg-cyan-500/10"
                          }
                        >
                          {isFranchisor ? "Franchisor" : "Franchisee"}
                        </Badge>
                        <span className="text-sm font-semibold">
                          {link.royaltyPct}% royalty
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>
                          Franchisor:{" "}
                          <span className="font-mono text-foreground">
                            {link.franchisorOrgId}
                          </span>
                        </p>
                        <p>
                          Franchisee:{" "}
                          <span className="font-mono text-foreground">
                            {link.franchiseeOrgId}
                          </span>
                        </p>
                        {link.termsUrl && (
                          <a
                            href={link.termsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-primary hover:underline"
                          >
                            <ExternalLink className="w-3 h-3" /> Terms
                          </a>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Created {formatDate(link.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {link.status === "pending" && !isFranchisor && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-emerald-400 border-emerald-500/40"
                          onClick={() =>
                            updateStatusMutation.mutate({
                              id: link.id,
                              status: "active",
                            })
                          }
                          disabled={updateStatusMutation.isPending}
                          data-ocid={`fff.franchise.accept_button.${idx + 1}`}
                        >
                          Accept
                        </Button>
                      )}
                      {link.status !== "terminated" && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-400 border-red-500/40 hover:bg-red-500/10"
                              data-ocid={`fff.franchise.delete_button.${idx + 1}`}
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
                                relationship. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel data-ocid="fff.terminate.cancel_button">
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground"
                                onClick={() =>
                                  updateStatusMutation.mutate({
                                    id: link.id,
                                    status: "terminated",
                                  })
                                }
                                data-ocid="fff.terminate.confirm_button"
                              >
                                Terminate
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FinFracFranPage({ user }: FinFracFranPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-display font-bold">
          Ownership & Franchising
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          FinFracFran™ — Financial Fractionalization & Franchising Framework
        </p>
      </div>

      <Tabs defaultValue="assets" className="space-y-5">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="assets" data-ocid="fff.assets.tab">
            Assets
          </TabsTrigger>
          <TabsTrigger value="ownership" data-ocid="fff.ownership.tab">
            Ownership
          </TabsTrigger>
          <TabsTrigger value="splits" data-ocid="fff.splits.tab">
            Revenue Splits
          </TabsTrigger>
          <TabsTrigger value="franchise" data-ocid="fff.franchise.tab">
            Franchise Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assets">
          <AssetsTab user={user} />
        </TabsContent>
        <TabsContent value="ownership">
          <OwnershipTab user={user} />
        </TabsContent>
        <TabsContent value="splits">
          <RevenueSplitsTab user={user} />
        </TabsContent>
        <TabsContent value="franchise">
          <FranchiseLinksTab user={user} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
