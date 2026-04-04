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
import { MOCK_TRANSACTIONS, MOCK_WALLETS } from "@/lib/mockData";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  ArrowUpDown,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

// MOCK DATA - Phase 3 will replace with real FinFracFran API
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

export default function WalletsFinance() {
  const [depositOpen, setDepositOpen] = useState(false);
  const [amount, setAmount] = useState("");

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
      </div>

      {/* Wallet cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {MOCK_WALLETS.map((wallet) => {
          const typeConfig = WALLET_TYPE_CONFIG[wallet.accountType] ?? {
            label: wallet.accountType,
            color: "bg-muted text-muted-foreground",
          };
          return (
            <Card key={wallet.id} className="border-border/60">
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
                  $
                  {wallet.balanceUSD.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                  })}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Frac: {(wallet.balanceFrac * 100).toFixed(2)}% •{" "}
                  {wallet.currency}
                </p>
                <div className="flex gap-2 mt-4">
                  <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="outline" className="flex-1">
                        <ArrowDownToLine className="w-3.5 h-3.5 mr-1" />
                        Deposit
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle className="font-display">
                          Deposit Funds
                        </DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-2">
                        <div className="space-y-2">
                          <Label>Amount (USD)</Label>
                          <Input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="0.00"
                          />
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            toast.success(
                              "Deposit initiated (Phase 3 Stripe integration)",
                            );
                            setDepositOpen(false);
                            setAmount("");
                          }}
                        >
                          Deposit via Stripe
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => toast.info("Transfer coming in Phase 3")}
                  >
                    <ArrowUpDown className="w-3.5 h-3.5 mr-1" />
                    Transfer
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Transaction history */}
      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Recent Transactions
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <div className="divide-y divide-border/40">
            {MOCK_TRANSACTIONS.map((tx) => {
              const Icon = TX_TYPE_ICONS[tx.txType] ?? ArrowRightLeft;
              const isPositive = tx.amount > 0;
              return (
                <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 ${isPositive ? "bg-teal-500/10" : "bg-destructive/10"}`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 ${isPositive ? "text-teal-400" : "text-destructive"}`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.txType} • {tx.createdAt}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p
                      className={`text-sm font-semibold font-display ${isPositive ? "text-teal-400" : "text-foreground"}`}
                    >
                      {isPositive ? "+" : ""}$
                      {Math.abs(tx.amount).toLocaleString()}
                    </p>
                    <Badge
                      variant="outline"
                      className="text-xs bg-teal-500/10 text-teal-400 border-teal-500/30"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
