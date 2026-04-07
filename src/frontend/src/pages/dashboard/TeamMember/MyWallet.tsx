import type { Transaction, WalletAccount } from "@/backend";
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
import { Skeleton } from "@/components/ui/skeleton";
import { useActor } from "@caffeineai/core-infrastructure";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  Loader2,
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

function formatDate(ns: bigint): string {
  return new Date(Number(ns) / 1_000_000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const TX_STATUS_COLOR: Record<string, string> = {
  completed: "bg-teal-500/10 text-teal-400 border-teal-500/30",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  failed: "bg-destructive/10 text-destructive border-destructive/30",
};

// ── Transfer dialog ───────────────────────────────────────────────────────────

interface TransferDialogProps {
  wallet: WalletAccount;
  onSuccess: () => void;
}

function TransferDialog({ wallet, onSuccess }: TransferDialogProps) {
  const { actor } = useActor(createActor);
  const [open, setOpen] = useState(false);
  const [toWalletId, setToWalletId] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!actor || !toWalletId.trim()) return;
    const icpAmount = Number.parseFloat(amount);
    if (Number.isNaN(icpAmount) || icpAmount <= 0) {
      toast.error("Enter a valid ICP amount");
      return;
    }
    const balance = e8sToIcp(wallet.balanceE8s);
    if (icpAmount > balance) {
      toast.error("Insufficient wallet balance");
      return;
    }
    setLoading(true);
    try {
      const result = await actor.transferICP(
        wallet.id,
        toWalletId.trim(),
        icpToE8s(icpAmount),
        description.trim() || "Transfer",
      );
      if (result.__kind__ === "ok") {
        toast.success(`Transferred ${icpAmount.toFixed(4)} ICP`);
        onSuccess();
        setOpen(false);
        setToWalletId("");
        setAmount("");
        setDescription("");
      } else {
        toast.error(result.err);
      }
    } catch {
      toast.error("Transfer failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const balance = e8sToIcp(wallet.balanceE8s);
  const isDisabled = balance === 0;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          variant="outline"
          disabled={isDisabled}
          data-ocid="my_wallet.transfer.open_modal_button"
        >
          <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
          Transfer
        </Button>
      </DialogTrigger>
      <DialogContent data-ocid="my_wallet.transfer.dialog">
        <DialogHeader>
          <DialogTitle className="font-display">Send ICP</DialogTitle>
          <DialogDescription>
            Transfer from{" "}
            <span className="text-foreground font-medium">{wallet.name}</span> —
            available: {balance.toFixed(4)} ICP
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="to-wallet-id">Recipient Wallet ID</Label>
            <Input
              id="to-wallet-id"
              value={toWalletId}
              onChange={(e) => setToWalletId(e.target.value)}
              placeholder="Paste destination wallet ID"
              data-ocid="my_wallet.transfer.input"
            />
            <p className="text-xs text-muted-foreground">
              Ask your org admin for the recipient wallet ID.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-amount">Amount (ICP)</Label>
            <Input
              id="transfer-amount"
              type="number"
              min="0"
              step="0.0001"
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.0000"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="transfer-note">
              Note{" "}
              <span className="text-muted-foreground text-xs">(optional)</span>
            </Label>
            <Input
              id="transfer-note"
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
            data-ocid="my_wallet.transfer.cancel_button"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || !toWalletId.trim() || !amount}
            data-ocid="my_wallet.transfer.submit_button"
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

export default function MyWallet() {
  const { actor, isFetching } = useActor(createActor);
  const [wallets, setWallets] = useState<WalletAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!actor || isFetching) return;
    setLoading(true);
    setError(null);
    try {
      const myWallets = await actor.getMyWallets();
      setWallets(myWallets);

      if (myWallets.length > 0) {
        const txResults = await Promise.all(
          myWallets.map((w) => actor.getTransactionHistory(w.id)),
        );
        const allTx: Transaction[] = [];
        for (const r of txResults) {
          if (r.__kind__ === "ok") allTx.push(...r.ok);
        }
        allTx.sort((a, b) => Number(b.createdAt - a.createdAt));
        setTransactions(allTx);
      }
    } catch {
      setError("Failed to load your wallet. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [actor, isFetching]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Primary wallet = first member_wallet, or just first wallet
  const primaryWallet =
    wallets.find((w) => w.accountType === "member_wallet") ?? wallets[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">My Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your personal FinFracFran™ wallet
        </p>
      </div>

      {/* Error */}
      {error && (
        <Card
          className="border-destructive/30 bg-destructive/5"
          data-ocid="my_wallet.error_state"
        >
          <CardContent className="p-4">
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading skeleton */}
      {loading && (
        <Card className="border-border/60" data-ocid="my_wallet.loading_state">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-xl" />
              <div className="space-y-1.5">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <Skeleton className="h-10 w-40" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty state */}
      {!loading && !error && wallets.length === 0 && (
        <Card
          className="border-dashed border-border/60"
          data-ocid="my_wallet.empty_state"
        >
          <CardContent className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="p-4 rounded-2xl bg-primary/10">
              <Wallet className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="font-display font-semibold text-lg">
                No wallet assigned yet
              </p>
              <p className="text-muted-foreground text-sm mt-1">
                Your org admin will set up your wallet. Check back soon.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Primary wallet card */}
      {!loading && primaryWallet && (
        <Card className="border-border/60 bg-gradient-to-br from-primary/5 via-transparent to-transparent">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/15">
                <Wallet className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">{primaryWallet.name}</p>
                <p className="text-xs text-muted-foreground">
                  {primaryWallet.currency} · Member Wallet
                </p>
              </div>
            </div>
            <p className="text-3xl font-display font-bold">
              {e8sToIcp(primaryWallet.balanceE8s).toFixed(4)}{" "}
              <span className="text-lg font-normal text-muted-foreground">
                ICP
              </span>
            </p>
            {primaryWallet.balanceE8s > BigInt(0) && (
              <div className="flex items-center gap-1.5 mt-1">
                <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
                <span className="text-xs text-teal-400">Balance available</span>
              </div>
            )}
            <div className="flex gap-3 mt-5">
              <Button
                size="sm"
                onClick={() =>
                  toast.info(
                    "Deposits are processed by your organization admin.",
                  )
                }
                data-ocid="my_wallet.deposit.button"
              >
                <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
                Deposit
              </Button>
              <TransferDialog wallet={primaryWallet} onSuccess={fetchData} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional wallets */}
      {!loading && wallets.length > 1 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {wallets.slice(1).map((wallet, idx) => (
            <Card
              key={wallet.id}
              className="border-border/60"
              data-ocid={`my_wallet.item.${idx + 2}`}
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <Wallet className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <p className="text-sm font-medium truncate">{wallet.name}</p>
                </div>
                <p className="text-lg font-display font-bold">
                  {e8sToIcp(wallet.balanceE8s).toFixed(4)}{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    ICP
                  </span>
                </p>
                <div className="mt-3">
                  <TransferDialog wallet={wallet} onSuccess={fetchData} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Transaction history */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          {loading ? (
            <div className="divide-y divide-border/40">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-3 px-5 py-3">
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="h-4 w-16" />
                </div>
              ))}
            </div>
          ) : transactions.length === 0 ? (
            <p
              className="text-muted-foreground text-sm text-center py-8"
              data-ocid="my_wallet.transactions.empty_state"
            >
              No transactions yet
            </p>
          ) : (
            <div className="divide-y divide-border/40">
              {transactions.map((tx, idx) => {
                const isIncoming = wallets.some((w) => w.id === tx.toWalletId);
                const isOutgoing = wallets.some(
                  (w) => w.id === tx.fromWalletId,
                );
                const icpAmount = e8sToIcp(tx.amountE8s);
                const statusColor =
                  TX_STATUS_COLOR[tx.status] ??
                  "bg-muted text-muted-foreground border-border";
                return (
                  <div
                    key={tx.id}
                    className="flex items-center gap-3 px-5 py-3"
                    data-ocid={`my_wallet.transactions.item.${idx + 1}`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {tx.description}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {tx.txType} • {formatDate(tx.createdAt)}
                      </p>
                    </div>
                    <div className="text-right shrink-0 space-y-1">
                      <p
                        className={`text-sm font-semibold font-display ${
                          isIncoming && !isOutgoing
                            ? "text-teal-400"
                            : "text-foreground"
                        }`}
                      >
                        {isIncoming && !isOutgoing
                          ? "+"
                          : isOutgoing
                            ? "-"
                            : ""}
                        {icpAmount.toFixed(4)} ICP
                      </p>
                      <Badge
                        variant="outline"
                        className={`text-xs ${statusColor}`}
                      >
                        {tx.status}
                      </Badge>
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
