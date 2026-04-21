export type TxType = "swap" | "transfer" | "stake";

export interface Transaction {
  time: string;
  program: string;
  solChange: number;
  token: string;
  type: TxType;
}

export const mockWallet = {
  address: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  solBalance: 1284.32,
  type: "Whale" as "Trader" | "Protocol" | "Whale",
  brief:
    "This wallet exhibits sophisticated on-chain behavior consistent with a high-conviction whale operator. Over the trailing 30 days, activity is dominated by liquidity provisioning on Orca and strategic SOL accumulation through Jupiter aggregator routes, with disciplined entry timing during market drawdowns. Net inflows of 312 SOL alongside selective exposure to mid-cap SPL tokens suggest a long-bias thesis. No interactions with known mixer programs or sanctioned addresses were detected, and stake delegations to validator clusters indicate yield-aware capital management.",
};

export const mockTransactions: Transaction[] = [
  { time: "2m ago",  program: "Jupiter",   solChange:  +12.45, token: "SOL → USDC", type: "swap" },
  { time: "14m ago", program: "Orca",      solChange:  -45.10, token: "SOL/JUP LP", type: "transfer" },
  { time: "47m ago", program: "Marinade",  solChange:  -100.0, token: "mSOL",       type: "stake" },
  { time: "1h ago",  program: "Raydium",   solChange:   +3.21, token: "BONK → SOL", type: "swap" },
  { time: "2h ago",  program: "Phoenix",   solChange:   -7.88, token: "SOL → JTO",  type: "swap" },
  { time: "3h ago",  program: "System",    solChange:  +250.0, token: "SOL",        type: "transfer" },
  { time: "5h ago",  program: "Jupiter",   solChange:   -18.6, token: "SOL → WIF",  type: "swap" },
  { time: "9h ago',  program: "Kamino",    solChange:   +0.42, token: "kSOL yield", type: "stake" },
  { time: "14h ago", program: "Tensor",    solChange:   -2.50, token: "Mad Lads",   type: "transfer" },
  { time: "1d ago",  program: "Drift",     solChange:   +9.14, token: "SOL-PERP",   type: "swap" },
];

export const mockActivity = [
  { day: "Mon", tx: 14 },
  { day: "Tue", tx: 28 },
  { day: "Wed", tx: 9  },
  { day: "Thu", tx: 42 },
  { day: "Fri", tx: 31 },
  { day: "Sat", tx: 18 },
  { day: "Sun", tx: 23 },
];