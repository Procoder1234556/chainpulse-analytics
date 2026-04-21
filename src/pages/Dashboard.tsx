import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { AIBrief } from "@/components/chainpulse/AIBrief";
import { ActivityChart } from "@/components/chainpulse/ActivityChart";
import { Logo } from "@/components/chainpulse/Logo";
import {
  CardSkeleton,
  ChartSkeleton,
  HeaderSkeleton,
  TableSkeleton,
} from "@/components/chainpulse/Skeletons";
import { TransactionsTable } from "@/components/chainpulse/TransactionsTable";
import { WalletHeader } from "@/components/chainpulse/WalletHeader";
import { analyzeWallet, type AnalyzeWalletResponse } from "@/lib/api";

const Dashboard = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const address = params.get("wallet") ?? "";

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<AnalyzeWalletResponse | null>(null);

  useEffect(() => {
    if (!address) {
      navigate("/", { replace: true });
      return;
    }

    let cancelled = false;
    setLoading(true);

    analyzeWallet(address)
      .then((res) => {
        if (!cancelled) setData(res);
      })
      .catch((err) => {
        console.error(err);
        if (!cancelled) toast.error("Failed to fetch wallet data");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [address, navigate]);

  return (
    <div className="min-h-screen bg-background">
      <div className="pointer-events-none fixed inset-0 -z-10 bg-gradient-hero opacity-60" />
      <header className="sticky top-0 z-20 border-b border-border/40 bg-background/70 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
          <Logo />
          <Link
            to="/"
            className="flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            New search
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-5 px-5 py-8 sm:px-8 sm:py-10">
        {loading || !data ? (
          <HeaderSkeleton />
        ) : (
          <WalletHeader address={address} walletType={data.walletType} />
        )}

        <div className="grid gap-5 lg:grid-cols-5">
          <div className="lg:col-span-3">
            {loading || !data ? <CardSkeleton lines={5} /> : <AIBrief brief={data.brief} />}
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
      </main>
    </div>
  );
};

export default Dashboard;