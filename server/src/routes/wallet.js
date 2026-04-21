import { Router } from "express";
import { fetchWalletTransactions } from "../services/helius.js";

const router = Router();

router.post("/analyze", async (req, res) => {
  const { address } = req.body || {};

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "address is required" });
  }

  try {
    const transactions = await fetchWalletTransactions(address);

    return res.json({
      transactions,
      brief: "This wallet is actively trading...",
      walletType: "Trader",
    });
  } catch (err) {
    console.error("[wallet/analyze] Helius fetch failed:", err?.response?.data || err?.message || err);
    return res.status(500).json({ error: "Helius fetch failed" });
  }
});

export default router;