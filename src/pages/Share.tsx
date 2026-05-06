import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPublicWallet } from "@/lib/api";
import { Logo } from "@/components/chainpulse/Logo";
import { HeaderSkeleton, CardSkeleton } from "@/components/chainpulse/Skeletons";

const Share = () => {
  const { wallet } = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{walletType: string, brief: string, tags: string[]} | null>(null);

  useEffect(() => {
    if (!wallet) return;
    
    getPublicWallet(wallet)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [wallet]);

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-hero opacity-50" />
      
      <header className="py-6 px-8 border-b border-border/40 bg-background/60 backdrop-blur-md">
        <div className="mx-auto max-w-4xl flex justify-between items-center">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <Logo />
          </Link>
          <span className="text-xs font-mono tracking-widest uppercase text-muted-foreground bg-primary/10 border border-primary/20 px-3 py-1 rounded-full text-primary">
            Public Analysis
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-2xl mx-auto space-y-6">
          <div className="text-center mb-8">
            <h1 className="text-xl sm:text-2xl font-mono text-muted-foreground mb-4">
              <span className="text-foreground tracking-tight">{wallet?.slice(0, 8)}...{wallet?.slice(-8)}</span>
            </h1>
          </div>

          {loading ? (
            <div className="space-y-6">
              <HeaderSkeleton />
              <CardSkeleton lines={4} />
            </div>
          ) : data ? (
            <div className="glass rounded-3xl p-6 sm:p-10 space-y-8 animate-fade-up shadow-glow">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full border border-primary/30 bg-primary/15 px-4 py-2 text-sm font-semibold uppercase tracking-wider text-primary">
                  {data.walletType}
                </span>
                {data.tags?.map(t => (
                  <span key={t} className="rounded-full border border-foreground/10 bg-foreground/5 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-foreground/70">
                    {t}
                  </span>
                ))}
              </div>

              <div className="prose prose-invert max-w-none">
                <div className="text-base sm:text-lg leading-relaxed text-foreground/90 whitespace-pre-wrap">
                  {data.brief}
                </div>
              </div>
            </div>
          ) : (
             <div className="text-center p-12 glass rounded-3xl">
                <p className="text-lg text-muted-foreground">Analysis not found or has expired.</p>
                <Link to="/" className="text-primary mt-4 inline-block hover:underline">Run new analysis</Link>
             </div>
          )}
        </div>
      </main>

      <footer className="py-8 text-center text-xs font-mono uppercase tracking-widest text-muted-foreground border-t border-border/20">
        Analyzed on ChainPulse
      </footer>
    </div>
  );
};

export default Share;
