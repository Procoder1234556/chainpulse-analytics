import { ArrowDownLeft, ArrowUpRight, Coins, Repeat } from "lucide-react";
import type { ApiTransaction } from "@/lib/api";

type TxType = "swap" | "transfer" | "stake";

const typeMeta: Record<TxType, { label: string; icon: typeof Repeat; cls: string }> = {
  swap:     { label: "swap",     icon: Repeat,         cls: "bg-primary/15 text-primary border-primary/30" },
  transfer: { label: "transfer", icon: ArrowUpRight,   cls: "bg-purple-500/15 text-purple-300 border-purple-400/30" },
  stake:    { label: "stake",    icon: Coins,          cls: "bg-amber-400/15 text-amber-300 border-amber-400/30" },
};

const fallback = typeMeta.transfer;

interface Props {
  transactions: ApiTransaction[];
}

export const TransactionsTable = ({ transactions }: Props) => (
  <div className="glass animate-fade-up overflow-hidden rounded-2xl" style={{ animationDelay: "180ms" }}>
    <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 sm:px-6">
      <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent Transactions</h2>
      <span className="font-mono text-xs text-muted-foreground">last 24h</span>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border/40 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
            <th className="px-5 py-3 font-medium sm:px-6">Time</th>
            <th className="px-5 py-3 font-medium">Program</th>
            <th className="px-5 py-3 text-right font-medium">SOL Change</th>
            <th className="px-5 py-3 font-medium">Token</th>
            <th className="px-5 py-3 font-medium">Type</th>
          </tr>
        </thead>
        <tbody>
          {transactions.length === 0 && (
            <tr>
              <td colSpan={5} className="px-5 py-8 text-center font-mono text-xs text-muted-foreground">
                no transactions found
              </td>
            </tr>
          )}
          {transactions.map((tx, i) => {
            const meta = typeMeta[tx.type as TxType] ?? fallback;
            const Icon = meta.icon;
            const positive = tx.solChange >= 0;
            return (
              <tr key={i} className="border-b border-border/30 transition-colors last:border-0 hover:bg-white/[0.02]">
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-muted-foreground sm:px-6">{tx.time}</td>
                <td className="whitespace-nowrap px-5 py-4 text-foreground">{tx.program}</td>
                <td className={`whitespace-nowrap px-5 py-4 text-right font-mono font-medium ${positive ? "text-success" : "text-destructive"}`}>
                  {positive ? "+" : ""}{tx.solChange.toFixed(2)}
                  {positive ? <ArrowUpRight className="ml-1 inline h-3 w-3" /> : <ArrowDownLeft className="ml-1 inline h-3 w-3" />}
                </td>
                <td className="whitespace-nowrap px-5 py-4 font-mono text-xs text-foreground/80">{tx.token}</td>
                <td className="px-5 py-4">
                  <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider ${meta.cls}`}>
                    <Icon className="h-3 w-3" />
                    {meta.label}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
);