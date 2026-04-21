import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Zap, Shield, LineChart, Clock } from "lucide-react";
import { Logo } from "@/components/chainpulse/Logo";
import { WalletInput } from "@/components/chainpulse/WalletInput";
import { analyzeWallet, getTrendingWallets } from "@/lib/api";
import { toast } from "sonner";
import { useRecentWallets } from "@/hooks/useRecentWallets";

const features = [
  { icon: Sparkles, title: "AI Briefs", desc: "Analyst-grade summaries of any wallet's behavior." },
  { icon: LineChart, title: "Real-time Activity", desc: "Track tx flow, swaps and stake movements live." },
  { icon: Shield, title: "Risk Signals", desc: "Mixer, sanctioned and exploit address detection." },
  { icon: Zap, title: "Sub-second Index", desc: "Powered by a hot Solana RPC mesh." },
];

const Index = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [trending, setTrending] = useState<{address: string, views: number}[]>([]);
  const [forcedInput, setForcedInput] = useState("");
  const { recents, addRecent } = useRecentWallets();

  useEffect(() => {
    getTrendingWallets().then(setTrending).catch(console.warn);
  }, []);

  const handleSubmit = async (address: string) => {
    setLoading(true);
    try {
      await analyzeWallet(address);
      addRecent(address);
      navigate(`/dashboard?wallet=${encodeURIComponent(address)}`);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch wallet data");
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-background">
      {/* Layered backgrounds */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-hero" />
      <div className="pointer-events-none absolute inset-0 -z-10 grid-bg opacity-40" />

      <header className="relative z-10">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <nav className="hidden items-center gap-7 text-sm text-muted-foreground sm:flex">
            <a href="#features" className="transition-colors hover:text-foreground">Features</a>
            <a href="#" className="transition-colors hover:text-foreground">Docs</a>
            <a href="#" className="font-mono text-xs uppercase tracking-widest text-primary">v0.1 · beta</a>
          </nav>
        </div>
      </header>

      <main className="relative z-10">
        <section className="mx-auto max-w-4xl px-5 pb-24 pt-16 text-center sm:px-8 sm:pt-24">
          <div className="mx-auto mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-3 py-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" />
            Solana mainnet · live
          </div>

          <h1 className="text-balance text-5xl font-semibold leading-[1.05] tracking-tight sm:text-6xl md:text-7xl">
            <span className="text-gradient">AI-Powered</span>
            <br />
            Solana Intelligence
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
            Drop any wallet. Get an instant analyst brief, behavioral profile,
            and on-chain activity timeline — in seconds.
          </p>

          <div className="mt-10 flex justify-center">
            <WalletInput onSubmit={handleSubmit} loading={loading} forcedValue={forcedInput} />
          </div>

          {trending.length > 0 && (
            <div className="mt-12 animate-fade-up">
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 mb-4">
                <span className="text-orange-500">🔥</span> Trending Wallets
              </h3>
              <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto">
                {trending.map((t) => (
                  <button
                    key={t.address}
                    onClick={() => setForcedInput(t.address)}
                    className="flex items-center gap-2 rounded-lg border border-border/50 bg-background/50 px-3 py-2 text-xs font-mono text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
                  >
                    <span>{t.address.slice(0, 4)}...{t.address.slice(-4)}</span>
                    <span className="rounded-full bg-primary/10 px-1.5 py-0.5 text-[10px] font-bold text-primary">
                      {t.views}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {recents.length > 0 && (
            <div className="mt-8 animate-fade-up" style={{ animationDelay: "80ms" }}>
              <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground flex items-center justify-center gap-2 mb-3">
                <Clock className="h-3.5 w-3.5" /> Recent Searches
              </h3>
              <ul className="flex flex-col items-center gap-1.5">
                {recents.map((addr) => (
                  <li key={addr}>
                    <button
                      onClick={() => {
                        setForcedInput(addr);
                        handleSubmit(addr);
                      }}
                      className="group flex items-center gap-2.5 rounded-xl border border-border/40 bg-background/40 px-4 py-2 text-xs font-mono text-muted-foreground backdrop-blur transition-all hover:border-primary/40 hover:bg-primary/5 hover:text-primary"
                    >
                      <Clock className="h-3 w-3 shrink-0 opacity-50 group-hover:opacity-100" />
                      <span>{addr.slice(0, 8)}…{addr.slice(-8)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>

        <section id="features" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                className="glass animate-fade-up rounded-2xl p-5 transition-all hover:border-primary/30 hover:shadow-glow"
                style={{ animationDelay: `${i * 70}ms` }}
              >
                <div className="mb-3 grid h-9 w-9 place-items-center rounded-lg bg-primary/15 text-primary">
                  <f.icon className="h-4 w-4" />
                </div>
                <h3 className="text-sm font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <footer className="border-t border-border/40 py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground sm:px-8">
            <span>© ChainPulse</span>
            <span>built for solana</span>
          </div>
        </footer>
      </main>
    </div>
  );
};

export default Index;
