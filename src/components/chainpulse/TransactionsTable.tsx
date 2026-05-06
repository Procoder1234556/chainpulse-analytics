import { ArrowDown, ArrowDownLeft, ArrowUp, ArrowUpRight, Coins, Repeat } from "lucide-react";
import { useMemo, useState } from "react";
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

const parseToHours = (timeStr: string) => {
  if (timeStr === "—") return Infinity;
  const match = timeStr.match(/(\d+)([smhd])/);
  if (!match) return Infinity;
  const val = parseInt(match[1], 10);
  const unit = match[2];
  if (unit === "s") return val / 3600;
  if (unit === "m") return val / 60;
  if (unit === "h") return val;
  if (unit === "d") return val * 24;
  return Infinity;
};

export const TransactionsTable = ({ transactions }: Props) => {
  const [typeFilter, setTypeFilter] = useState<"ALL" | "SWAP" | "TRANSFER">("ALL");
  const [timeFilter, setTimeFilter] = useState<"1h" | "6h" | "24h">("24h");
  const [sortConfig, setSortConfig] = useState<{ key: "time" | "solChange"; direction: "desc" | "asc" }>({
    key: "time",
    direction: "desc", // Default: desc (Latest first, or highest solChange first)
  });

  const filteredAndSorted = useMemo(() => {
    let result = transactions;

    // Filter by type
    if (typeFilter !== "ALL") {
      result = result.filter((tx) => (tx.type || "").toUpperCase() === typeFilter);
    }

    // Filter by time
    const maxHours = timeFilter === "1h" ? 1 : timeFilter === "6h" ? 6 : 24;
    result = result.filter((tx) => parseToHours(tx.time) <= maxHours);

    // Sort
    return result.sort((a, b) => {
      if (sortConfig.key === "time") {
        const aHours = parseToHours(a.time);
        const bHours = parseToHours(b.time);
        return sortConfig.direction === "desc" ? aHours - bHours : bHours - aHours;
      } else if (sortConfig.key === "solChange") {
        return sortConfig.direction === "desc" ? b.solChange - a.solChange : a.solChange - b.solChange;
      }
      return 0;
    });
  }, [transactions, typeFilter, timeFilter, sortConfig]);

  const handleSort = (key: "time" | "solChange") => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc",
    }));
  };

  const renderSortIcon = (key: "time" | "solChange") => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === "asc" ? <ArrowUp className="ml-1 inline h-3 w-3" /> : <ArrowDown className="ml-1 inline h-3 w-3" />;
  };

  return (
    <div className="glass animate-fade-up overflow-hidden rounded-2xl" style={{ animationDelay: "180ms" }}>
      <div className="flex flex-col gap-4 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Recent Transactions</h2>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary/50"
            >
              <option value="ALL">All</option>
              <option value="SWAP">Swap</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wider text-muted-foreground">Time:</span>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value as any)}
              className="rounded-md border border-border/50 bg-background/50 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-foreground outline-none focus:border-primary/50"
            >
              <option value="24h">Last 24h</option>
              <option value="6h">Last 6h</option>
              <option value="1h">Last 1h</option>
            </select>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border/40 text-left text-[11px] uppercase tracking-widest text-muted-foreground">
              <th 
                className="cursor-pointer select-none px-5 py-3 font-medium hover:text-foreground sm:px-6 transition-colors"
                onClick={() => handleSort("time")}
              >
                Time {renderSortIcon("time")}
              </th>
              <th className="px-5 py-3 font-medium">Program</th>
              <th 
                className="cursor-pointer select-none px-5 py-3 text-right font-medium hover:text-foreground transition-colors"
                onClick={() => handleSort("solChange")}
              >
                SOL Change {renderSortIcon("solChange")}
              </th>
              <th className="px-5 py-3 font-medium">Token</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 text-right font-medium">PnL (SOL)</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 && (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center font-mono text-xs text-muted-foreground">
                  no transactions found matching criteria
                </td>
              </tr>
            )}
            {filteredAndSorted.map((tx, i) => {
              const meta = typeMeta[(tx.type || "").toLowerCase() as TxType] ?? fallback;
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
                  <td className={`whitespace-nowrap px-5 py-4 text-right font-mono text-xs ${
                    tx.pnl === null
                      ? "text-muted-foreground/40"
                      : tx.pnl > 0
                        ? "text-green-400"
                        : tx.pnl < 0
                          ? "text-red-400"
                          : "text-muted-foreground"
                  }`}>
                    {tx.pnl === null
                      ? "—"
                      : `${tx.pnl >= 0 ? "+" : ""}${tx.pnl.toFixed(3)}`
                    }
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};