import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import pepe from "@/assets/pepe-mascot.png";
import { analyzeWallet, type AnalyzeWalletResponse } from "@/lib/api";

export default function PepeDashboard() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const address = params.get("wallet") ?? "";
  const [data, setData] = useState<AnalyzeWalletResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [input, setInput] = useState("");

  useEffect(() => {
    if (!address) { setLoading(false); return; }
    setLoading(true); setError(false);
    analyzeWallet(address)
      .then(setData)
      .catch(() => { setError(true); toast.error("Frog couldn't read this wallet"); })
      .finally(() => setLoading(false));
  }, [address]);

  return (
    <div className="min-h-screen bg-[hsl(150_35%_7%)] text-[hsl(80_20%_92%)] font-pepe">
      <style>{`
        .font-pepe { font-family: "Space Grotesk", sans-serif; }
        .font-display { font-family: "Bungee", "Space Grotesk", sans-serif; letter-spacing: 0.02em; }
        .pepe-text { color: hsl(95 60% 55%); }
        .pepe-bg { background: hsl(95 60% 55%); }
        .swamp-card { background: hsl(150 30% 10%); border: 1px solid hsl(100 30% 18%); }
        .swamp-deep { background: hsl(150 40% 4%); }
        .pond-bg {
          background:
            radial-gradient(ellipse 70% 40% at 0% 0%, hsl(95 60% 25% / 0.25), transparent 60%),
            radial-gradient(ellipse 50% 30% at 100% 100%, hsl(95 70% 35% / 0.2), transparent 60%);
        }
      `}</style>
      <link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet" />

      <header className="border-b border-[hsl(100_30%_18%)] swamp-deep">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <Link to="/pepe" className="font-display text-lg pepe-text">🐸 PEPECHAIN</Link>
          <div className="flex items-center gap-3">
            <Link to="/pepe" className="text-xs font-bold uppercase tracking-widest text-[hsl(100_12%_60%)] hover:text-[hsl(95_60%_55%)]">← Home</Link>
          </div>
        </div>
      </header>

      <main className="pond-bg mx-auto max-w-7xl px-5 py-10 sm:px-8">
        {/* Search */}
        <form
          onSubmit={(e) => { e.preventDefault(); if (input.trim()) navigate(`/pepe/dashboard?wallet=${encodeURIComponent(input.trim())}`); }}
          className="flex max-w-2xl overflow-hidden rounded-full border-2 border-[hsl(95_60%_55%)] swamp-deep"
        >
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="paste a wallet to inspect…" className="flex-1 bg-transparent px-5 py-3 font-mono text-sm outline-none placeholder:text-[hsl(100_12%_60%)]" />
          <button className="pepe-bg px-6 font-display text-xs uppercase text-[hsl(150_40%_4%)]">Analyze</button>
        </form>

        {!address && (
          <div className="mt-16 grid place-items-center text-center">
            <img src={pepe} alt="" width={240} height={240} className="opacity-60" />
            <p className="mt-4 font-display text-xl pepe-text">DROP A WALLET, FROG</p>
            <p className="mt-2 text-sm text-[hsl(100_12%_60%)]">paste any solana address above to start ribbiting</p>
          </div>
        )}

        {address && (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {/* Wallet card */}
            <div className="swamp-card rounded-3xl p-6 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-[hsl(100_12%_60%)]">Wallet</div>
                  <div className="mt-1 font-mono text-base">{address.slice(0, 8)}…{address.slice(-8)}</div>
                </div>
                {loading ? (
                  <div className="h-8 w-24 animate-pulse rounded-full bg-[hsl(95_60%_55%/0.15)]" />
                ) : data ? (
                  <span className="rounded-full pepe-bg px-4 py-1.5 font-display text-xs text-[hsl(150_40%_4%)]">{data.walletType}</span>
                ) : null}
              </div>

              <div className="mt-6 grid grid-cols-3 gap-4">
                {[
                  { l: "Txns", v: loading ? "—" : data?.transactions.length ?? 0 },
                  { l: "PnL", v: loading ? "—" : (data?.totalPnL?.toFixed(2) ?? "—") },
                  { l: "Win Rate", v: loading ? "—" : (data?.winRate ? `${data.winRate.toFixed(0)}%` : "—") },
                ].map((m) => (
                  <div key={m.l} className="swamp-deep rounded-2xl p-4 text-center">
                    <div className="font-display text-2xl pepe-text">{m.v}</div>
                    <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-[hsl(100_12%_60%)]">{m.l}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mascot card */}
            <div className="swamp-card relative overflow-hidden rounded-3xl p-6">
              <div className="text-[10px] font-bold uppercase tracking-[0.25em] pepe-text">Frog Verdict</div>
              {loading ? (
                <div className="mt-3 space-y-2">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-[hsl(95_60%_55%/0.2)]" />
                  <div className="h-3 w-2/3 animate-pulse rounded bg-[hsl(95_60%_55%/0.15)]" />
                </div>
              ) : error ? (
                <p className="mt-3 italic text-[hsl(100_12%_60%)]">Couldn't fetch. Maybe a typo?</p>
              ) : (
                <p className="mt-3 text-sm leading-relaxed">{data?.copyHint ?? "no clear signal."}</p>
              )}
              <img src={pepe} alt="" width={140} height={140} className="absolute -bottom-4 -right-4 opacity-90" />
            </div>

            {/* AI Brief */}
            <div className="swamp-card rounded-3xl p-6 lg:col-span-3">
              <div className="flex items-center gap-2">
                <span className="font-display text-sm pepe-text">🐸 AI BRIEF</span>
                <span className="rounded-full bg-[hsl(95_60%_55%/0.15)] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest pepe-text">live</span>
              </div>
              {loading ? (
                <div className="mt-4 space-y-2">
                  {[80, 95, 70, 88].map((w, i) => (
                    <div key={i} className="h-3 animate-pulse rounded bg-[hsl(95_60%_55%/0.12)]" style={{ width: `${w}%` }} />
                  ))}
                </div>
              ) : error ? (
                <p className="mt-4 italic text-[hsl(100_12%_60%)]">Could not analyze wallet. Check address and try again.</p>
              ) : data?.brief === "Analysis unavailable" ? (
                <p className="mt-4 italic text-[hsl(100_12%_60%)]">Brief unavailable right now. Try again shortly.</p>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-[hsl(80_20%_88%)]">{data?.brief}</p>
              )}
            </div>

            {/* Transactions */}
            <div className="swamp-card rounded-3xl p-6 lg:col-span-3">
              <div className="mb-4 font-display text-sm pepe-text">RECENT RIBBITS</div>
              {loading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-10 animate-pulse rounded-xl bg-[hsl(95_60%_55%/0.08)]" />
                  ))}
                </div>
              ) : data?.transactions.length ? (
                <div className="overflow-hidden rounded-xl border border-[hsl(100_30%_18%)]">
                  <table className="w-full text-sm">
                    <thead className="swamp-deep text-[10px] uppercase tracking-widest text-[hsl(100_12%_60%)]">
                      <tr>
                        <th className="px-4 py-3 text-left">Time</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-left">Token</th>
                        <th className="px-4 py-3 text-right">SOL Δ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.transactions.map((t, i) => (
                        <tr key={i} className="border-t border-[hsl(100_30%_18%)]">
                          <td className="px-4 py-3 font-mono text-xs text-[hsl(100_12%_60%)]">{t.time}</td>
                          <td className="px-4 py-3"><span className="rounded-full bg-[hsl(95_60%_55%/0.12)] px-2 py-0.5 text-[10px] font-bold uppercase pepe-text">{t.type}</span></td>
                          <td className="px-4 py-3 font-mono text-xs">{t.token}</td>
                          <td className={`px-4 py-3 text-right font-mono text-xs ${t.solChange >= 0 ? "text-[hsl(95_60%_55%)]" : "text-[hsl(0_70%_60%)]"}`}>
                            {t.solChange >= 0 ? "+" : ""}{t.solChange}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-[hsl(100_12%_60%)]">no recent activity. this frog is hibernating.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}