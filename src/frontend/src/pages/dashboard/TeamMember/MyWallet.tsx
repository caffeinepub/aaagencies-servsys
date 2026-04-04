import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_TRANSACTIONS, MOCK_WALLETS } from "@/lib/mockData";
import {
  ArrowDownToLine,
  ArrowRightLeft,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { toast } from "sonner";

// MOCK DATA - Phase 3 will replace with real wallet API
export default function MyWallet() {
  const memberWallet =
    MOCK_WALLETS.find((w) => w.accountType === "member_wallet") ??
    MOCK_WALLETS[2];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-display font-semibold">My Wallet</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Your personal FinFracFran™ wallet
        </p>
      </div>

      <Card className="border-border/60 bg-gradient-to-r from-primary/5 to-transparent">
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 rounded-xl bg-primary/15">
              <Wallet className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Member Wallet</p>
              <p className="text-xs text-muted-foreground">
                {memberWallet.currency}
              </p>
            </div>
          </div>
          <p className="text-3xl font-display font-bold">
            $
            {memberWallet.balanceUSD.toLocaleString("en-US", {
              minimumFractionDigits: 2,
            })}
          </p>
          <div className="flex items-center gap-1.5 mt-1">
            <TrendingUp className="w-3.5 h-3.5 text-teal-400" />
            <span className="text-xs text-teal-400">
              Fractional share: {(memberWallet.balanceFrac * 100).toFixed(2)}%
            </span>
          </div>
          <div className="flex gap-3 mt-4">
            <Button
              size="sm"
              onClick={() => toast.info("Deposit coming in Phase 3")}
            >
              <ArrowDownToLine className="w-3.5 h-3.5 mr-1.5" />
              Deposit
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => toast.info("Transfer coming in Phase 3")}
            >
              <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />
              Transfer
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display">
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 pb-2">
          <div className="divide-y divide-border/40">
            {MOCK_TRANSACTIONS.filter(
              (t) => t.walletId === memberWallet.id,
            ).map((tx) => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {tx.description}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {tx.txType} • {tx.createdAt}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-semibold ${tx.amount > 0 ? "text-teal-400" : "text-foreground"}`}
                  >
                    {tx.amount > 0 ? "+" : ""}$
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
            ))}
            {MOCK_TRANSACTIONS.filter((t) => t.walletId === memberWallet.id)
              .length === 0 && (
              <p className="text-muted-foreground text-sm text-center py-6">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
