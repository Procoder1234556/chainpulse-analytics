import { Bell, Loader2, Send } from "lucide-react";
import { FormEvent, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { createAlert } from "@/lib/api";

interface Props {
  address: string;
}

export const AlertDialog = ({ address }: Props) => {
  const [open, setOpen] = useState(false);
  const [chatId, setChatId] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!chatId.trim()) return;

    setSubmitting(true);
    try {
      await createAlert(address, chatId.trim());
      toast.success("Alert activated ✅");
      setChatId("");
      setOpen(false);
    } catch (err) {
      console.error(err);
      toast.error("Failed to create alert");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero" size="sm" className="h-9 px-4">
          <Bell className="h-4 w-4" />
          Set Alert
        </Button>
      </DialogTrigger>

      <DialogContent className="glass-strong max-w-md border-border/60 sm:rounded-2xl">
        <DialogHeader>
          <div className="mb-2 grid h-10 w-10 place-items-center rounded-xl bg-primary/15 text-primary">
            <Send className="h-5 w-5" />
          </div>
          <DialogTitle className="text-xl tracking-tight">Set wallet alert</DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            We'll ping you on Telegram whenever this wallet makes a move.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <label
              htmlFor="chatId"
              className="text-xs font-semibold uppercase tracking-widest text-muted-foreground"
            >
              Your Telegram Chat ID
            </label>
            <input
              id="chatId"
              value={chatId}
              onChange={(e) => setChatId(e.target.value)}
              placeholder="123456789"
              autoFocus
              spellCheck={false}
              className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-primary/60 focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <p className="font-mono text-[11px] text-muted-foreground">
              Send <span className="text-primary">/start</span> to{" "}
              <span className="text-primary">@chainpulse_bot</span> to get your chat ID
            </p>
          </div>

          <Button
            type="submit"
            variant="hero"
            className="w-full"
            disabled={submitting || !chatId.trim()}
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Activating…
              </>
            ) : (
              <>
                <Bell className="h-4 w-4" />
                Activate Alert
              </>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};