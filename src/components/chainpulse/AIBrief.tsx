import { Sparkles } from "lucide-react";
import { mockWallet } from "@/data/mockWallet";

export const AIBrief = () => (
  <div className="glass animate-fade-up rounded-2xl p-5 sm:p-6" style={{ animationDelay: "60ms" }}>
    <div className="mb-4 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="grid h-8 w-8 place-items-center rounded-lg bg-primary/15 text-primary">
          <Sparkles className="h-4 w-4" />
        </div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">AI Brief</h2>
      </div>
      <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-success">
        <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse-glow" /> live
      </span>
    </div>
    <p className="text-sm leading-relaxed text-foreground/90 sm:text-[0.95rem]">
      {mockWallet.brief}
    </p>
  </div>
);