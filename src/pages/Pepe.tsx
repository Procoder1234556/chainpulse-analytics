import { Link } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import pepe from "@/assets/pepe-mascot.png";

const stats = [
  { v: "4", l: "Total Supply (B)" },
  { v: "4", l: "Burned (B)" },
  { v: "100%", l: "LP Locked" },
  { v: "1B", l: "Holders Goal" },
];

const features = [
  { t: "Frog-Powered Indexing", d: "Helius RPC mesh slurps Solana txns faster than a fly into a frog mouth." },
  { t: "AI Wallet Briefs", d: "Claude reads on-chain ribbits and translates them to plain English alpha." },
  { t: "Whale-watch Alerts", d: "Telegram pings the moment a chad wallet rotates capital. Stay swamp-aware." },
  { t: "Copy-Trade Hints", d: "We surface what big frogs are accumulating — you decide if you hop in." },
];

const roadmap = [
  { q: "Q1", t: "Spawn", items: ["Launch on Solana", "Helius integration", "AI brief MVP"] },
  { q: "Q2", t: "Swarm", items: ["Telegram alert bot", "Whale watch list", "Public wallet shares"] },
  { q: "Q3", t: "Stampede", items: ["Copy-trade signals", "Mobile app", "PRO tier"] },
  { q: "Q4", t: "Empire", items: ["Multi-chain", "DAO governance", "Frog NFTs"] },
];

export default function Pepe() {
  const [addr, setAddr] = useState("");
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[hsl(var(--swamp-bg))] text-[hsl(var(--swamp-fg))] font-pepe">
      <style>{`
        :root {
          --swamp-bg: 150 35% 7%;
          --swamp-deep: 150 40% 4%;
          --swamp-card: 150 30% 10%;
          --swamp-border: 100 30% 18%;
          --swamp-fg: 80 20% 92%;
          --swamp-muted: 100 12% 60%;
          --pepe: 95 60% 55%;
          --pepe-dark: 95 70% 35%;
          --pepe-glow: 95 90% 65%;
        }
        .font-pepe { font-family: "Space Grotesk", sans-serif; }
        .font-display { font-family: "Bungee", "Space Grotesk", sans-serif; letter-spacing: 0.02em; }
        .pepe-text { color: hsl(var(--pepe)); }
        .pepe-bg { background: hsl(var(--pepe)); }
        .swamp-card { background: hsl(var(--swamp-card)); border: 1px solid hsl(var(--swamp-border)); }
        .noise-bg {
          background:
            radial-gradient(ellipse 70% 50% at 20% 0%, hsl(var(--pepe) / 0.15), transparent 60%),
            radial-gradient(ellipse 60% 40% at 100% 100%, hsl(var(--pepe-dark) / 0.25), transparent 60%);
        }
        .ticker { animation: ticker 40s linear infinite; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .float-y { animation: float-y 4s ease-in-out infinite; }
        @keyframes float-y { 0%,100% { transform: translateY(-8px) rotate(-2deg); } 50% { transform: translateY(8px) rotate(2deg); } }
        .stamp { transform: rotate(-3deg); }
      `}</style>
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet" />

      {/* Nav */}
      <header className="relative z-20 border-b border-[hsl(var(--swamp-border))]">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-2 font-display text-lg pepe-text">
            🐸 PEPECHAIN
          </div>
          <nav className="hidden items-center gap-8 text-xs font-bold uppercase tracking-widest md:flex">
            <a href="#features" className="hover:pepe-text transition-colors">Home</a>
            <a href="#features" className="hover:text-[hsl(var(--pepe))]">About</a>
            <a href="#" className="hover:text-[hsl(var(--pepe))]">Twitter</a>
            <a href="#" className="hover:text-[hsl(var(--pepe))]">Telegram</a>
          </nav>
          <Link
            to="/pepe/dashboard"
            className="rounded-full pepe-bg px-5 py-2 text-xs font-display text-[hsl(var(--swamp-deep))] shadow-[0_4px_0_0_hsl(var(--pepe-dark))] hover:translate-y-[1px] hover:shadow-[0_3px_0_0_hsl(var(--pepe-dark))] transition-all"
          >
            Launch App
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden noise-bg">
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          <div className="flex flex-col justify-center">
            <div className="mb-4 inline-flex w-fit items-center gap-2 rounded-full border border-[hsl(var(--pepe)/0.3)] bg-[hsl(var(--pepe)/0.1)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.25em] pepe-text">
              <span className="h-1.5 w-1.5 rounded-full pepe-bg animate-pulse" /> Live on Solana
            </div>
            <h1 className="font-display text-5xl leading-[0.95] sm:text-6xl md:text-7xl">
              USHERING THE <br />
              <span className="pepe-text">MEME ECONOMY</span> <br />
              TO THE NEXT LEVEL
            </h1>
            <p className="mt-6 max-w-md text-base text-[hsl(var(--swamp-muted))]">
              PepeChain is the AI-native intelligence layer for memecoin degens.
              Drop a wallet, get the alpha, ribbit responsibly.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (addr.trim()) navigate(`/pepe/dashboard?wallet=${encodeURIComponent(addr.trim())}`);
              }}
              className="mt-8 flex max-w-lg overflow-hidden rounded-full border-2 border-[hsl(var(--pepe))] bg-[hsl(var(--swamp-deep))]"
            >
              <input
                value={addr}
                onChange={(e) => setAddr(e.target.value)}
                placeholder="paste a solana wallet…"
                className="flex-1 bg-transparent px-5 py-3 font-mono text-sm outline-none placeholder:text-[hsl(var(--swamp-muted))]"
              />
              <button className="pepe-bg px-6 font-display text-xs uppercase text-[hsl(var(--swamp-deep))]">
                Hop In
              </button>
            </form>

            <div className="mt-10 grid grid-cols-4 gap-3">
              {stats.map((s) => (
                <div key={s.l} className="swamp-card rounded-xl p-3 text-center">
                  <div className="font-display text-xl pepe-text">{s.v}</div>
                  <div className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[hsl(var(--swamp-muted))]">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative grid place-items-center">
            <div className="absolute inset-0 -z-10 rounded-full bg-[hsl(var(--pepe)/0.15)] blur-3xl" />
            <img src={pepe} alt="Pepe mascot" width={480} height={480} className="float-y w-[80%] max-w-[480px] drop-shadow-[0_20px_40px_hsl(var(--pepe-dark)/0.5)]" />
            <div className="stamp absolute right-0 top-4 swamp-card rounded-2xl border-[hsl(var(--pepe))] px-4 py-2 font-display text-xs pepe-text">
              $PEPE • LIVE
            </div>
          </div>
        </div>

        {/* Marquee */}
        <div className="border-y-2 border-[hsl(var(--pepe))] pepe-bg overflow-hidden">
          <div className="flex whitespace-nowrap py-3 ticker">
            {Array.from({ length: 2 }).map((_, k) => (
              <div key={k} className="flex shrink-0 items-center gap-8 pr-8 font-display text-sm text-[hsl(var(--swamp-deep))]">
                {Array.from({ length: 12 }).map((__, i) => (
                  <span key={i}>RIBBIT • $PEPE • TO THE MOON • FROG SZN • </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="mb-12 text-center">
          <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] pepe-text">Features</div>
          <h2 className="font-display text-3xl sm:text-5xl">WHY YOU SHOULD <br /><span className="pepe-text">RIDE THE FROG</span></h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => (
            <div key={f.t} className="swamp-card group relative overflow-hidden rounded-2xl p-6 transition-all hover:-translate-y-1 hover:border-[hsl(var(--pepe))]">
              <div className="mb-4 grid h-10 w-10 place-items-center rounded-xl pepe-bg font-display text-[hsl(var(--swamp-deep))]">
                {String(i + 1).padStart(2, "0")}
              </div>
              <h3 className="font-display text-lg">{f.t}</h3>
              <p className="mt-2 text-sm text-[hsl(var(--swamp-muted))]">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Roadmap */}
      <section className="border-y border-[hsl(var(--swamp-border))] bg-[hsl(var(--swamp-deep))] py-24">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="mb-12 text-center">
            <div className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] pepe-text">Roadmap</div>
            <h2 className="font-display text-3xl sm:text-5xl">FROM TADPOLE <br /><span className="pepe-text">TO SWAMP KING</span></h2>
          </div>
          <div className="grid gap-5 md:grid-cols-4">
            {roadmap.map((r) => (
              <div key={r.q} className="swamp-card rounded-2xl p-6">
                <div className="font-mono text-xs pepe-text">{r.q} 2026</div>
                <div className="mt-1 font-display text-2xl">{r.t}</div>
                <ul className="mt-4 space-y-2 text-sm text-[hsl(var(--swamp-muted))]">
                  {r.items.map((x) => (
                    <li key={x} className="flex items-start gap-2">
                      <span className="pepe-text">▸</span>{x}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-5xl px-5 py-24 text-center sm:px-8">
        <h2 className="font-display text-4xl leading-tight sm:text-6xl">
          READY TO <span className="pepe-text">HOP IN</span>?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-[hsl(var(--swamp-muted))]">
          Stop staring at block explorers. Let the frog read the chain for you.
        </p>
        <Link
          to="/pepe/dashboard"
          className="mt-8 inline-block rounded-full pepe-bg px-8 py-4 font-display text-sm text-[hsl(var(--swamp-deep))] shadow-[0_6px_0_0_hsl(var(--pepe-dark))] hover:translate-y-[2px] hover:shadow-[0_4px_0_0_hsl(var(--pepe-dark))] transition-all"
        >
          Launch Dashboard →
        </Link>
      </section>

      <footer className="border-t border-[hsl(var(--swamp-border))] py-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 font-mono text-[10px] uppercase tracking-widest text-[hsl(var(--swamp-muted))] sm:px-8">
          <span>© PEPECHAIN 2026</span>
          <span>not financial advice. just frogs.</span>
        </div>
      </footer>
    </div>
  );
}