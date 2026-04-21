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
}

export const WalletHeader = ({ address, walletType, solBalance }: Props) => {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 1400);
  };

  return (
    <div className="glass animate-fade-up rounded-2xl p-5 sm:p-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-gradient-primary shadow-glow">
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

        <div className="flex flex-wrap items-center gap-2">
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
      </div>
    </div>
  );
};