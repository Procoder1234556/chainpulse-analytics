import { Router } from "express";

const router = Router();

router.post("/analyze", (req, res) => {
  const { address } = req.body || {};

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "address is required" });
  }

  return res.json({
    transactions: [
      { time: "2h ago", program: "Jupiter", solChange: -0.5, token: "USDC", type: "swap" },
      { time: "5h ago", program: "Raydium", solChange: +2.1, token: "SOL", type: "transfer" },
    ],
    brief: "This wallet is actively trading...",
    walletType: "Trader",
  });
});

export default router;