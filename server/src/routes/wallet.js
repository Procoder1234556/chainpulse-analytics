import { Router } from "express";
import { fetchWalletTransactions } from "../services/helius.js";
import { generateWalletBrief } from "../services/claude.js";

const router = Router();

function classifyWallet(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return "Holder";

  if (transactions.length > 10) return "Whale";

  const swaps = transactions.filter(
    (t) => typeof t.type === "string" && t.type.toUpperCase() === "SWAP",
  ).length;

  if (swaps > transactions.length / 2) return "Trader";

  return "Holder";
}

router.post("/analyze", async (req, res) => {
  const { address } = req.body || {};

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "address is required" });
  }

  try {
    const transactions = await fetchWalletTransactions(address);

    const walletType = classifyWallet(transactions);

    let brief = "Analysis unavailable";
    try {
      brief = await generateWalletBrief(transactions);
    } catch (err) {
      console.error(
        "[wallet/analyze] Claude brief failed:",
        err?.response?.data || err?.message || err,
      );
    }

    return res.json({
      transactions,
      brief,
      walletType,
    });
  } catch (err) {
    console.error("[wallet/analyze] Helius fetch failed:", err?.response?.data || err?.message || err);
    return res.status(500).json({ error: "Helius fetch failed" });
  }
});

export default router;