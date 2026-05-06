import { ArrowLeft, Share2 } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AIBrief } from "@/components/chainpulse/AIBrief";
import { ActivityChart } from "@/components/chainpulse/ActivityChart";
import { AlertDialog } from "@/components/chainpulse/AlertDialog";
import { Logo } from "@/components/chainpulse/Logo";
import {
  CardSkeleton,
  ChartSkeleton,
  HeaderSkeleton,
  TableSkeleton,
  BriefSkeleton,
} from "@/components/chainpulse/Skeletons";
import { TransactionsTable } from "@/components/chainpulse/TransactionsTable";
import { WalletHeader } from "@/components/chainpulse/WalletHeader";
import { CopyHintCard } from "@/components/chainpulse/CopyHintCard";
import { analyzeWallet, compareWallets, getMe, autoSignup, type AnalyzeWalletResponse, type CompareWalletsResponse } from "@/lib/api";

const CompareView = ({ data, address1, address2 }: { data: CompareWalletsResponse, address1: string, address2: string }) => {
  const isW1MoreActive = data.wallet1.transactions.length >= data.wallet2.transactions.length;
  const verdict = `Wallet 1 is ${isW1MoreActive ? "more" : "less"} active than Wallet 2`;

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="glass rounded-2xl p-5 text-center font-semibold text-lg text-primary shadow-glow">
        Verdict: {verdict}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {/* Wallet 1 */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Wallet 1 <span className="font-mono lowercase">({address1.slice(0,4)}...{address1.slice(-4)})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
             <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
               {data.wallet1.walletType}
             </span>
             {data.wallet1.tags?.map(t => (
               <span key={t} className="rounded-full border border-foreground/10 bg-foreground/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/70">
                 {t}
               </span>
             ))}
          </div>
          <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{data.wallet1.brief}</div>
          <div className="text-xs font-mono text-muted-foreground">{data.wallet1.transactions.length} recent transactions</div>
        </div>
        
        {/* Wallet 2 */}
        <div className="glass rounded-2xl p-6 space-y-5">
          <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Wallet 2 <span className="font-mono lowercase">({address2.slice(0,4)}...{address2.slice(-4)})</span>
          </h3>
          <div className="flex flex-wrap gap-2">
             <span className="rounded-full border border-primary/30 bg-primary/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-primary">
               {data.wallet2.walletType}
             </span>
             {data.wallet2.tags?.map(t => (
               <span key={t} className="rounded-full border border-foreground/10 bg-foreground/5 px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-foreground/70">
                 {t}
               </span>
             ))}
          </div>
          <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap">{data.wallet2.brief}</div>
          <div className="text-xs font-mono text-muted-foreground">{data.wallet2.transactions.length} recent transactions</div>
        </div>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const address = params.get("wallet") ?? "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyzeWalletResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [compareInput, setCompareInput] = useState("");
  const [comparing, setComparing] = useState(false);
  const [compareData, setCompareData] = useState<CompareWalletsResponse | null>(null);

  const [userTier, setUserTier] = useState<string>("");

  useEffect(() => {
    const initSession = async () => {
      try {
        if (!localStorage.getItem("token")) await autoSignup();
        const { user } = await getMe();
        setUserTier(user.tier);
      } catch (err) {
        console.warn("Failed session init", err);
      }
    };
    initSession();

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    if (!address) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);
    setCompareData(null); // Reset compare data on new address
    setCompareInput("");

    analyzeWallet(address)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) {
          setError("Could not analyze wallet. Check address and try again.");
          toast.error("Failed to fetch wallet data");
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, navigate]);

  const handleCompare = async () => {
    if (!compareInput || compareInput === address) return;
    setComparing(true);
    try {
      const res = await compareWallets(address, compareInput);
      setCompareData(res);
    } catch (err) {
      toast.error("Failed to compare wallets");
    } finally {
      setComparing(false);
    }
  };

  const handleShare = () => {
    if (!address) return;
    const url = `${window.location.origin}/share/${address}`;
    navigator.clipboard.writeText(url);
    toast.success("Share link copied to clipboard!");
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-hero opacity-60" />
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <div className="flex items-center gap-3">
            {userTier && (
              <div className="hidden sm:flex items-center justify-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-primary">
                {userTier} PLAN
              </div>
            )}
            {address && (
              <>
                <Button variant="outline" size="sm" className="h-9 px-3 gap-2 bg-background/50 backdrop-blur" onClick={handleShare}>
                  <Share2 className="h-4 w-4" />
                  <span className="hidden sm:inline">Share</span>
                </Button>
                <AlertDialog address={address} onUpgradeSuccess={() => setUserTier("PRO")} />
              </>
            )}
            <Link
              to="/"
              className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">New search</span>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-5 py-8 sm:px-8 sm:py-10">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input 
            type="text" 
            placeholder="Enter second wallet address to compare..." 
            value={compareInput} 
            onChange={e => setCompareInput(e.target.value)}
            className="flex-1 rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm font-mono outline-none focus:border-primary/50 transition-colors placeholder:font-sans"
          />
          <button 
            onClick={handleCompare} 
            disabled={comparing || !compareInput}
            className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {comparing ? "Comparing..." : "Compare Wallets"}
          </button>
        </div>

        {compareData ? (
          <CompareView data={compareData} address1={address} address2={compareInput} />
        ) : error ? (
          <div className="glass animate-fade-up rounded-2xl p-8 text-center">
            <h3 className="text-base font-semibold text-foreground">Could not analyze wallet</h3>
            <p className="mt-2 text-sm text-muted-foreground">Check address and try again.</p>
            <button
              onClick={() => navigate("/")}
              className="mt-5 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Back to search
            </button>
          </div>
        ) : (
          <>
            {loading || !data ? (
              <HeaderSkeleton />
            ) : (
              <WalletHeader address={address} walletType={data.walletType} tags={data.tags} totalPnL={data.totalPnL} winRate={data.winRate} isAlpha={data.isAlpha} />
            )}

            {!loading && data?.copyHint && (
              <CopyHintCard hint={data.copyHint} isAlpha={data.isAlpha} />
            )}

            <div className="grid gap-5 lg:grid-cols-5">
              <div className="lg:col-span-3">
                {loading || !data ? <BriefSkeleton /> : <AIBrief brief={data.brief} />}
              </div>
              <div className="lg:col-span-2">
                {loading ? <ChartSkeleton /> : <ActivityChart />}
              </div>
            </div>

            {loading || !data ? (
              <TableSkeleton />
            ) : (
              <TransactionsTable transactions={data.transactions} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Dashboard;