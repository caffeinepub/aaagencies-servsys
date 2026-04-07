import { AccountType, type Transaction, type WalletAccount } from "@/backend";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { useActor } from "@caffeineai/core-infrastructure";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpDown,
  Loader2,
  Plus,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { createActor } from "../../../backend";

// ── helpers ──────────────────────────────────────────────────────────────────

function e8sToIcp(e8s: bigint): number {
  return Number(e8s) / 1e8;
}

function icpToE8s(icp: number): bigint {
  return BigInt(Math.floor(icp * 1e8));
}

function formatIcp(e8s: bigint): string {
  return `${e8sToIcp(e8s).toFixed(4)} ICP`;
}

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ── static configs ───────────────────────────────────────────────────────────

const WALLET_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  org_treasury: {
    label: "Org Treasury",
    color: "bg-amber-500/15 text-amber-400 border-amber-500/30",
  },
  branch_fund: {
    label: "Branch Fund",
    color: "bg-blue-500/15 text-blue-400 border-blue-500/30",
  },
  member_wallet: {
    label: "Member Wallet",
    color: "bg-teal-500/15 text-teal-400 border-teal-500/30",
  },
  vendor_account: {
    label: "Vendor Account",
    color: "bg-purple-500/15 text-purple-400 border-purple-500/30",
  },
};

const TX_TYPE_ICONS: Record<string, React.ElementType> = {
  deposit: ArrowDownToLine,
  withdrawal: TrendingDown,
  transfer: ArrowRightLeft,
  fractionalize: TrendingDown,
  distribute: TrendingUp,
};

const TX_STATUS_COLOR: Record<string, string> = {
  completed: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

// ── sub-components ────────────────────────────────────────────────────────────

function WalletSkeleton() {
  return (
    <Card className="border-border/60">
      <CardContent className="p-5 space-y-3">
        <div className="flex items-start justify-between">
          <Skeleton className="h-8 w-8 rounded-lg" />
          <Skeleton className="h-5 w-24 rounded-full" />
        </div>
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-8 w-40" />
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
        </div>
      </CardContent>
    </Card>
  );
}

// ── Create Wallet Dialog ──────────────────────────────────────────────────────

interface CreateWalletDialogProps {
  orgId: string;
  onCreated: () => void;
}

function CreateWalletDialog({ orgId, onCreated }: CreateWalletDialogProps) {
  const { actor } = useActor(createActor);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [accountType, setAccountType] = useState<AccountType>(
    AccountType.org_treasury,
  );
  const [branchId, setBranchId] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!actor || !name.trim()) return;
    setLoading(true);
    try {
      const result = await actor.createWallet({
        orgId,
        name: name.trim(),
        accountType,
        branchId: branchId.trim() || undefined,
      });
      if (result.__kind__ === "ok") {
        toast.success(`Wallet "${result.ok.name}" created successfully`);
        onCreated();
        setOpen(false);
        setName("");
        setBranchId("");
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Failed to create wallet");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" data-ocid="wallets.new_wallet_button">
          <Plus className="w-3.5 h-3.5 mr-1.5" />
          New Wallet
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="wallets.create_wallet.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Create New Wallet</DialogTitle>
          <DialogDescription>
            Add a new FinFracFran™ wallet account to your organization.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="wallet-name">Wallet Name</Label>
            <Input
              id="wallet-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Operations Treasury"
              data-ocid="wallets.create_wallet.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="wallet-type">Account Type</Label>
            <Select
              value={accountType}
              onValueChange={(v) => setAccountType(v as AccountType)}
            >
              <SelectTrigger
                id="wallet-type"
                data-ocid="wallets.create_wallet.select"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={AccountType.org_treasury}>
                  Org Treasury
                </SelectItem>
                <SelectItem value={AccountType.branch_fund}>
                  Branch Fund
                </SelectItem>
                <SelectItem value={AccountType.member_wallet}>
                  Member Wallet
                </SelectItem>
                <SelectItem value={AccountType.vendor_account}>
                  Vendor Account
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="branch-id">
              Branch ID{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="branch-id"
              value={branchId}
              onChange={(e) => setBranchId(e.target.value)}
              placeholder="Leave blank for org-level wallet"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="wallets.create_wallet.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !name.trim()}
            data-ocid="wallets.create_wallet.submit_button"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {loading ? "Creating…" : "Create Wallet"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Deposit Dialog ────────────────────────────────────────────────────────────

interface DepositDialogProps {
  wallet: WalletAccount;
  onSuccess: () => void;
}

function DepositDialog({ wallet, onSuccess }: DepositDialogProps) {
  const { actor } = useActor(createActor);
  const [open, setOpen] = useState(false);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!actor) return;
    const icpAmount = Number.parseFloat(amount);
    if (Number.isNaN(icpAmount) || icpAmount <= 0) {
      toast.error("Enter a valid ICP amount");
      return;
    }
    setLoading(true);
    try {
      const result = await actor.depositToWallet(
        wallet.id,
        icpToE8s(icpAmount),
        description.trim() || "Admin deposit",
      );
      if (result.__kind__ === "ok") {
        toast.success(
          `Deposited ${icpAmount.toFixed(4)} ICP to ${wallet.name}`,
        );
        onSuccess();
        setOpen(false);
        setAmount("");
        setDescription("");
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Deposit failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          data-ocid="wallets.deposit.open_modal_button"
        >
          <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
          Deposit
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="wallets.deposit.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Deposit to Wallet</DialogTitle>
          <DialogDescription>
            Top up{" "}
            <span className="text-foreground font-medium">{wallet.name}</span>{" "}
            with ICP tokens.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="deposit-amount">Amount (ICP)</Label>
            <Input
              id="deposit-amount"
              type="number"
              min="0"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              data-ocid="wallets.deposit.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deposit-desc">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="deposit-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Admin deposit"
              data-ocid="wallets.deposit.textarea"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="wallets.deposit.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !amount}
            data-ocid="wallets.deposit.submit_button"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {loading ? "Processing…" : "Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Transfer Dialog ───────────────────────────────────────────────────────────

interface TransferDialogProps {
  wallet: WalletAccount;
  allWallets: WalletAccount[];
  onSuccess: () => void;
}

function TransferDialog({
  wallet,
  allWallets,
  onSuccess,
}: TransferDialogProps) {
  const { actor } = useActor(createActor);
  const [open, setOpen] = useState(false);
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const destinations = allWallets.filter((w) => w.id !== wallet.id);

  async function handleSubmit() {
    if (!actor || !toWalletId) return;
    const icpAmount = Number.parseFloat(amount);
    if (Number.isNaN(icpAmount) || icpAmount <= 0) {
      toast.error("Enter a valid ICP amount");
      return;
    }
    const balance = e8sToIcp(wallet.balanceE8s);
    if (icpAmount > balance) {
      toast.error("Insufficient balance");
      return;
    }
    setLoading(true);
    try {
      const result = await actor.transferICP(
        wallet.id,
        toWalletId,
        icpToE8s(icpAmount),
        description.trim() || "Transfer",
      );
      if (result.__kind__ === "ok") {
        const dest = allWallets.find((w) => w.id === toWalletId);
        toast.success(
          `Transferred ${icpAmount.toFixed(4)} ICP to ${dest?.name ?? toWalletId}`,
        );
        onSuccess();
        setOpen(false);
        setToWalletId("");
        setAmount("");
        setDescription("");
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Transfer failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          className="flex-1"
          disabled={wallet.balanceE8s === BigInt(0)}
          data-ocid="wallets.transfer.open_modal_button"
        >
          <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="wallets.transfer.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Transfer ICP</DialogTitle>
          <DialogDescription>
            Send ICP from{" "}
            <span className="text-foreground font-medium">{wallet.name}</span>{" "}
            (balance: {formatIcp(wallet.balanceE8s)}).
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="to-wallet">Destination Wallet</Label>
            {destinations.length > 0 ? (
              <Select value={toWalletId} onValueChange={setToWalletId}>
                <SelectTrigger
                  id="to-wallet"
                  data-ocid="wallets.transfer.select"
                >
                  <SelectValue placeholder="Select destination wallet" />
                </SelectTrigger>
                <SelectContent>
                  {destinations.map((w) => (
                    <SelectItem key={w.id} value={w.id}>
                      {w.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <p className="text-sm text-muted-foreground py-2">
                No other wallets available in this organization.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Amount (ICP)</Label>
            <Input
              id="transfer-amount"
              type="number"
              min="0"
              step="0.0001"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
              data-ocid="wallets.transfer.input"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-desc">
              Description{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="transfer-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Transfer"
            />
          </div>
        </div>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            data-ocid="wallets.transfer.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              loading || !toWalletId || !amount || destinations.length === 0
            }
            data-ocid="wallets.transfer.submit_button"
          >
            {loading && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
            {loading ? "Sending…" : "Send ICP"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function WalletsFinance() {
  const { actor, isFetching } = useActor(createActor);
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!actor || isFetching) return;
    setLoading(true);
    setError(null);
    try {
      const org = await actor.getMyOrganization();
      if (!org) {
        setError("No organization found for your account.");
        setLoading(false);
        return;
      }
      setOrgId(org.id);

      const [walletsResult, txResult] = await Promise.all([
        actor.getWalletsByOrg(org.id),
        actor.getTransactionHistoryByOrg(org.id),
      ]);

      if (walletsResult.__kind__ === "ok") {
        setWallets(walletsResult.ok);
      } else {
        setError(walletsResult.err);
      }

      if (txResult.__kind__ === "ok") {
        setTransactions(txResult.ok);
      }
    } catch {
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const walletNameById = (id: string) =>
    wallets.find((w) => w.id === id)?.name ?? `${id.slice(0, 12)}…`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-display font-semibold">
            Wallets & Finance
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            FinFracFran™ multi-wallet management
          </p>
        </div>
        {orgId && !loading && (
          <CreateWalletDialog orgId={orgId} onCreated={fetchData} />
        )}
      </div>

      {/* Error state */}
      {error && (
        <Card
          className="border-destructive/30 bg-destructive/5"
          data-ocid="wallets.error_state"
        >
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading skeletons */}
      {loading && (
        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-ocid="wallets.loading_state"
        >
          <WalletSkeleton />
          <WalletSkeleton />
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && wallets.length === 0 && (
        <Card
          className="border-dashed border-border/60"
          data-ocid="wallets.empty_state"
        >
          <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-lg">
                No wallets yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Create your first FinFracFran™ wallet to start managing funds.
              </p>
            </div>
            {orgId && (
              <CreateWalletDialog orgId={orgId} onCreated={fetchData} />
            )}
          </CardContent>
        </Card>
      )}

      {/* Wallet cards */}
      {!loading && wallets.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.map((wallet, idx) => {
            const typeConfig = WALLET_TYPE_CONFIG[wallet.accountType] ?? {
              label: wallet.accountType,
              color: "bg-muted text-muted-foreground",
            };
            const icpBalance = e8sToIcp(wallet.balanceE8s);
            return (
              <Card
                key={wallet.id}
                className="border-border/60"
                data-ocid={`wallets.item.${idx + 1}`}
              >
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Wallet className="w-4 h-4 text-primary" />
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${typeConfig.color}`}
                    >
                      {typeConfig.label}
                    </Badge>
                  </div>
                  <h3 className="font-display font-semibold text-sm mb-1">
                    {wallet.name}
                  </h3>
                  <p className="text-2xl font-display font-bold text-foreground">
                    {icpBalance.toFixed(4)}{" "}
                    <span className="text-base font-normal text-muted-foreground">
                      ICP
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Currency: {wallet.currency} •{" "}
                    {wallet.isActive ? "Active" : "Inactive"}
                  </p>
                  <div className="flex gap-2 mt-4">
                    <DepositDialog wallet={wallet} onSuccess={fetchData} />
                    <TransferDialog
                      wallet={wallet}
                      allWallets={wallets}
                      onSuccess={fetchData}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Transaction history */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Transaction History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {loading ? (
            <div className="divide-y divide-border/40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <Skeleton className="h-7 w-7 rounded-lg shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p
              className="text-muted-foreground text-sm text-center py-8"
              data-ocid="wallets.transactions.empty_state"
            >
              No transactions yet
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {transactions
                .slice()
                .sort((a, b) => Number(b.createdAt - a.createdAt))
                .map((tx, idx) => {
                  const Icon = TX_TYPE_ICONS[tx.txType] ?? ArrowRightLeft;
                  const statusColor =
                    TX_STATUS_COLOR[tx.status] ??
                    "bg-muted text-muted-foreground border-border";
                  const icpAmount = e8sToIcp(tx.amountE8s);
                  const fromName = walletNameById(tx.fromWalletId);
                  const toName = walletNameById(tx.toWalletId);
                  return (
                    <div
                      key={tx.id}
                      className="flex items-center gap-3 px-5 py-3"
                      data-ocid={`wallets.transactions.item.${idx + 1}`}
                    >
                      <div className="p-1.5 rounded-lg shrink-0 bg-primary/10">
                        <Icon className="w-3.5 h-3.5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {tx.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {fromName} → {toName} • {formatDate(tx.createdAt)}
                        </p>
                      </div>
                      <div className="shrink-0 text-right space-y-1">
                        <p className="text-sm font-semibold font-display">
                          {icpAmount.toFixed(4)} ICP
                        </p>
                        <div className="flex items-center gap-1.5 justify-end">
                          <Badge
                            variant="outline"
                            className={`text-xs ${statusColor}`}
                          >
                            {tx.status}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="text-xs bg-muted/50 text-muted-foreground border-border/50"
                          >
                            {tx.txType}
                          </Badge>
                        </div>
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
