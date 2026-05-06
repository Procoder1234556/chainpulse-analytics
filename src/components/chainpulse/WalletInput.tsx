import { ArrowRight, Loader2, Search } from "lucide-react";
import { FormEvent, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  onSubmit: (address: string) => void;
  loading?: boolean;
  forcedValue?: string;
}

const SAMPLE = "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU";

export const WalletInput = ({ onSubmit, loading, forcedValue }: Props) => {
  const [value, setValue] = useState("");

  useEffect(() => {
    if (forcedValue) setValue(forcedValue);
  }, [forcedValue]);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit((value || SAMPLE).trim());
  };

  return (
    <form onSubmit={submit} className="w-full max-w-2xl">
      <div className="glass-strong group relative flex flex-col items-stretch gap-2 rounded-2xl p-2 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3 px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <input
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Paste a Solana wallet address…"
            className="w-full bg-transparent py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/70 focus:outline-none"
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <Button type="submit" variant="hero" size="lg" disabled={loading} className="sm:min-w-[180px]">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Analyzing…
            </>
          ) : (
            <>
              Analyze Wallet
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
      <button
        type="button"
        onClick={() => setValue(SAMPLE)}
        className="mt-3 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
      >
        try sample → <span className="underline-offset-4 group-hover:underline">{SAMPLE.slice(0, 8)}…{SAMPLE.slice(-6)}</span>
      </button>
    </form>
  );
};