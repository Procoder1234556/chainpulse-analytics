import { Eye } from "lucide-react";

interface Props {
  hint: string;
  isAlpha?: boolean;
}

export const CopyHintCard = ({ hint, isAlpha }: Props) => (
  <div
    className={`glass animate-fade-up rounded-2xl p-5 sm:p-6 transition-all ${
      isAlpha
        ? "border border-orange-500/20"
        : "border border-border/40"
    }`}
    style={{ animationDelay: "120ms" }}
  >
    <div className="flex items-start gap-4">
      <div
        className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl ${
          isAlpha
            ? "bg-orange-500/15 text-orange-400"
            : "bg-primary/15 text-primary"
        }`}
      >
        <Eye className="h-4 w-4" />
      </div>
      <div className="space-y-1.5">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
          What this wallet is doing right now
        </p>
        <p className="text-sm leading-relaxed text-foreground/90">{hint}</p>
      </div>
    </div>
  </div>
);
