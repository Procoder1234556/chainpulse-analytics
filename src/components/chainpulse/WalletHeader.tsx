import { Copy, Wallet } from "lucide-react";
import { useState } from "react";

const truncate = (a: string) => `${a.slice(0, 6)}…${a.slice(-6)}`;

const typeStyles: Record<string, string> = {
  Whale: "bg-primary/15 text-primary border-primary/30",
  Trader: "bg-success/15 text-success border-success/30",
  Protocol: "bg-purple-500/15 text-purple-300 border-purple-400/30",
};

interface Props {
  address: string;
  walletType: string;
  solBalance?: number;
  tags?: string[];
  totalPnL?: number;
  winRate?: number;
  isAlpha?: boolean;
}

export const WalletHeader = ({ address, walletType, solBalance, tags, totalPnL, winRate, isAlpha }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className={`glass animate-fade-up rounded-2xl p-5 sm:p-6 transition-all ${
      isAlpha
        ? "border border-orange-500/40 shadow-[0_0_24px_2px_rgba(249,115,22,0.18)]"
        : ""
    }`}>
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className={`grid h-12 w-12 shrink-0 place-items-center rounded-xl shadow-glow ${
            isAlpha ? "bg-gradient-to-br from-orange-500 to-amber-400" : "bg-gradient-primary"
          }`}>
            <Wallet className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="min-w-0">
            <div className="text-xs uppercase tracking-widest text-muted-foreground">Wallet</div>
            <button
              onClick={copy}
              className="group mt-0.5 flex items-center gap-2 font-mono text-base font-medium text-foreground transition-colors hover:text-primary sm:text-lg"
            >
              {truncate(address)}
              <Copy className="h-3.5 w-3.5 opacity-50 group-hover:opacity-100" />
              {copied && <span className="text-xs text-success">copied</span>}
            </button>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2 sm:items-start">
          <div className="flex flex-wrap items-center gap-2">
            {isAlpha && (
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-500/40 bg-orange-500/10 px-3 py-1.5 text-xs font-bold tracking-wide text-orange-400 animate-pulse">
                🔥 Alpha Wallet
              </span>
            )}
            {typeof solBalance === "number" && (
              <span className="glass-strong rounded-full px-4 py-1.5 font-mono text-sm">
                <span className="text-muted-foreground">SOL</span>{" "}
                <span className="font-semibold text-foreground">{solBalance.toLocaleString()}</span>
              </span>
            )}
            <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold uppercase tracking-wider ${typeStyles[walletType] ?? typeStyles.Trader}`}>
              {walletType}
            </span>
          </div>
          {tags && tags.length > 0 && (
            <div className="flex flex-wrap items-center justify-end gap-1.5 sm:justify-start">
              {tags.map((t) => (
                <span
                  key={t}
                  className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest ${
                    t === "Active Trader"
                      ? "bg-green-500/10 border-green-500/20 text-green-500"
                      : t === "High Volume"
                        ? "bg-yellow-500/10 border-yellow-500/20 text-yellow-500"
                        : t === "Distributor"
                          ? "bg-red-500/10 border-red-500/20 text-red-500"
                          : "bg-gray-500/10 border-gray-500/20 text-gray-400"
                  }`}
                >
                  {t}
                </span>
              ))}
            </div>
          )}
          {typeof totalPnL === "number" && (
            <div className="flex flex-wrap items-center justify-end gap-2 sm:justify-start mt-0.5">
              <span className={`rounded-full border px-3 py-1 text-xs font-mono font-semibold ${
                totalPnL >= 0
                  ? "bg-green-500/10 border-green-500/20 text-green-400"
                  : "bg-red-500/10 border-red-500/20 text-red-400"
              }`}>
                PnL {totalPnL >= 0 ? "+" : ""}{totalPnL.toFixed(3)} SOL
              </span>
              {typeof winRate === "number" && (
                <span className="rounded-full border border-border/40 bg-background/40 px-3 py-1 text-xs font-mono text-muted-foreground">
                  Win rate {winRate}%
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};