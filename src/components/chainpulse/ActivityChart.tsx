import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { mockActivity } from "@/data/mockWallet";

export const ActivityChart = () => (
  <div className="glass animate-fade-up rounded-2xl p-5 sm:p-6" style={{ animationDelay: "120ms" }}>
    <div className="mb-4 flex items-center justify-between">
      <div>
        <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">Activity</h2>
        <div className="mt-1 font-mono text-2xl font-semibold text-foreground">
          {mockActivity.reduce((s, d) => s + d.tx, 0)}
          <span className="ml-2 text-xs font-normal text-muted-foreground">tx · 7d</span>
        </div>
      </div>
      <span className="rounded-full border border-success/30 bg-success/10 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-success">
        +18.4%
      </span>
    </div>
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={mockActivity} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
          <defs>
            <linearGradient id="barFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary-glow))" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
          <XAxis dataKey="day" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <YAxis stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
          <Tooltip
            cursor={{ fill: "hsl(var(--primary) / 0.08)" }}
            contentStyle={{
              background: "hsl(var(--popover))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
              fontFamily: "JetBrains Mono, monospace",
            }}
            labelStyle={{ color: "hsl(var(--muted-foreground))" }}
          />
          <Bar dataKey="tx" fill="url(#barFill)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);