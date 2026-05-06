import { Router } from "express";
import { fetchWalletTransactions } from "../services/helius.js";
import { generateWalletBrief } from "../services/claude.js";
import { getCachedWallet, setCachedWallet } from "../services/cache.js";
import { incrementWalletAnalyses } from "../services/analytics.js";
import { calculatePnL } from "../services/pnl.js";
import { authMiddleware } from "../middleware/auth.js";
import { createTierRateLimiter } from "../middleware/rateLimiter.js";
import { logger } from "../utils/logger.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const walletViews = new Map();

/**
 * Optional auth: reads the JWT and populates req.user if valid,
 * but never blocks the request if the token is absent or invalid.
 */
async function optionalAuth(req, _res, next) {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) {
    try {
      await authMiddleware(req, { status: () => ({ json: () => {} }) }, next);
      return;
    } catch {
      // ignore — treat as unauthenticated
    }
  }
  next();
}

const analyzeRateLimit = createTierRateLimiter("walletAnalyze");

function classifyWallet(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return "Holder";

  if (transactions.length > 10) return "Whale";

  const swaps = transactions.filter(
    (t) => typeof t.type === "string" && t.type.toUpperCase() === "SWAP",
  ).length;

  if (swaps > transactions.length / 2) return "Trader";

  return "Holder";
}

function computeTags(transactions) {
  if (!Array.isArray(transactions) || transactions.length === 0) return ["Dormant"];
  
  const tags = [];
  const totalTx = transactions.length;
  let swaps = 0;
  let transfers = 0;
  let totalSolChange = 0;

  for (const t of transactions) {
    const type = typeof t.type === "string" ? t.type.toUpperCase() : "";
    if (type === "SWAP") swaps++;
    if (type === "TRANSFER") transfers++;
    if (typeof t.solChange === "number") {
      totalSolChange += Math.abs(t.solChange);
    }
  }

  if (swaps > totalTx / 2) tags.push("Active Trader");
  if (transfers > totalTx / 2) tags.push("Distributor");
  
  const avgSolChange = totalSolChange / totalTx;
  if (avgSolChange > 1) tags.push("High Volume");
  
  if (totalTx <= 5) tags.push("Dormant");

  return tags;
}

/**
 * Score a wallet to determine if it shows alpha-generating behaviour.
 *
 * +2  avg SOL change > 1 SOL (high-value moves)
 * +2  winRate > 60%        (profitable trader)
 * +2  > 50% of txns are SWAPs (active on DEXes)
 * -2  > 60% of txns are TRANSFERs (passive distributor)
 *
 * @returns {{ score: number, isAlpha: boolean }}
 */
function scoreWallet(transactions, winRate) {
  if (!Array.isArray(transactions) || transactions.length === 0) {
    return { score: 0, isAlpha: false };
  }

  let score = 0;
  const totalTx = transactions.length;
  let swaps = 0;
  let transfers = 0;
  let totalSolChange = 0;

  for (const t of transactions) {
    const type = typeof t.type === "string" ? t.type.toUpperCase() : "";
    if (type === "SWAP") swaps++;
    if (type === "TRANSFER") transfers++;
    if (typeof t.solChange === "number") totalSolChange += Math.abs(t.solChange);
  }

  const avgSolChange = totalSolChange / totalTx;

  if (avgSolChange > 1) score += 2;
  if (winRate > 60) score += 2;
  if (swaps / totalTx > 0.5) score += 2;
  if (transfers / totalTx > 0.6) score -= 2;

  return { score, isAlpha: score >= 4 };
}

/**
 * Analyze the last 5 transactions to produce a copy-trading signal.
 * Looks for repeated buys or sells on the same token.
 *
 * @param {Array} transactions  Raw transaction array (most recent first)
 * @returns {string} copyHint
 */
function generateCopyHint(transactions) {
  const recent = transactions.slice(0, 5);
  if (recent.length === 0) return "No recent activity detected.";

  // Accumulate buy/sell counts per token (using the last 4 chars of mint as label)
  const buyCount  = new Map(); // token → count
  const sellCount = new Map(); // token → count

  for (const tx of recent) {
    const type = (tx.type || "").toUpperCase();
    if (type !== "SWAP") continue;

    // Prefer last-4 of mint, fall back to tx.token field
    const label = tx.mint ? tx.mint.slice(-4).toUpperCase() : (tx.token || "UNKNOWN");

    if (tx.solChange < 0) {
      // SOL out → bought token
      buyCount.set(label, (buyCount.get(label) || 0) + 1);
    } else if (tx.solChange > 0) {
      // SOL in → sold token
      sellCount.set(label, (sellCount.get(label) || 0) + 1);
    }
  }

  // Find the token with the highest repeated buys
  let topBuyToken = null, topBuyCount = 0;
  for (const [token, count] of buyCount) {
    if (count > topBuyCount) { topBuyToken = token; topBuyCount = count; }
  }

  // Find the token with highest repeated sells
  let topSellToken = null, topSellCount = 0;
  for (const [token, count] of sellCount) {
    if (count > topSellCount) { topSellToken = token; topSellCount = count; }
  }

  const hasSwaps = topBuyCount + topSellCount > 0;
  if (!hasSwaps) {
    // Fallback: summarise transfer direction
    const transfers = recent.filter(t => (t.type || "").toUpperCase() === "TRANSFER");
    if (transfers.length > 0) {
      const totalOut = transfers.filter(t => t.solChange < 0).length;
      return totalOut >= transfers.length / 2
        ? "This wallet is distributing SOL — possibly paying out to multiple addresses."
        : "This wallet is receiving consistent SOL transfers — possible accumulation via OTC.";
    }
    return "No clear directional signal in the last 5 transactions.";
  }

  // Determine dominant signal
  if (topBuyCount >= 2 && topBuyCount >= topSellCount) {
    const intensity = topBuyCount >= 3 ? "aggressively" : "steadily";
    return `This wallet is accumulating ${topBuyToken} ${intensity} — ${topBuyCount} buys in the last 5 swaps.`;
  }

  if (topSellCount >= 2 && topSellCount > topBuyCount) {
    const intensity = topSellCount >= 3 ? "rapidly" : "gradually";
    return `This wallet is exiting ${topSellToken} ${intensity} — ${topSellCount} sells in the last 5 swaps.`;
  }

  if (topBuyToken && topSellToken && topBuyToken !== topSellToken) {
    return `This wallet is rotating from ${topSellToken} into ${topBuyToken} — a possible sector switch.`;
  }

  if (topBuyToken) {
    return `This wallet made a single swap into ${topBuyToken} — watching for follow-through.`;
  }

  return "Mixed swap activity — no single directional signal identified.";
}

async function fetchAndAnalyzeWallet(address) {
  incrementWalletAnalyses();

  const currentViews = walletViews.get(address) || 0;
  walletViews.set(address, currentViews + 1);

  const cachedData = getCachedWallet(address);
  if (cachedData) {
    return { ...cachedData, cached: true };
  }

  const rawTransactions = await fetchWalletTransactions(address);
  const walletType = classifyWallet(rawTransactions);
  const tags = computeTags(rawTransactions);

  // Run PnL estimation over raw transactions (annotates each with pnl field)
  const { transactions, totalPnL, winRate } = calculatePnL(rawTransactions);

  // Score the wallet for alpha signal
  const { isAlpha } = scoreWallet(rawTransactions, winRate);

  // Generate copy-trading insight
  const copyHint = generateCopyHint(rawTransactions);

  let brief = "Analysis unavailable";
  try {
    brief = await generateWalletBrief(transactions);
  } catch (err) {
    logger.error(`[wallet/analyze] Claude brief failed for ${address}`, {
      error: err?.response?.data || err?.message || err,
    });
  }

  const responseData = {
    transactions,
    brief,
    walletType,
    tags,
    totalPnL,
    winRate,
    isAlpha,
    copyHint,
  };

  setCachedWallet(address, responseData);

  return { ...responseData, cached: false };
}

router.get("/trending", asyncHandler(async (_req, res) => {
  const trending = Array.from(walletViews.entries())
    .map(([address, views]) => ({ address, views }))
    .sort((a, b) => b.views - a.views)
    .slice(0, 10);
  return res.json(trending);
}));

router.get("/public/:address", asyncHandler(async (req, res) => {
  const { address } = req.params;
  
  if (!address) {
    return res.status(400).json({ error: "address is required" });
  }

  const cachedData = getCachedWallet(address);
  if (!cachedData) {
    return res.status(404).json({ error: "Analysis not found or expired" });
  }

  return res.json({
    walletType: cachedData.walletType,
    brief: cachedData.brief,
    tags: cachedData.tags
  });
}));

router.post("/analyze", optionalAuth, analyzeRateLimit, asyncHandler(async (req, res) => {
  const { address } = req.body || {};

  if (!address || typeof address !== "string") {
    return res.status(400).json({ error: "address is required" });
  }

  const result = await fetchAndAnalyzeWallet(address);
  return res.json(result);
}));

router.post("/compare", optionalAuth, analyzeRateLimit, asyncHandler(async (req, res) => {
  const { address1, address2 } = req.body || {};

  if (!address1 || !address2 || typeof address1 !== "string" || typeof address2 !== "string") {
    return res.status(400).json({ error: "address1 and address2 are required" });
  }

  const [wallet1, wallet2] = await Promise.all([
    fetchAndAnalyzeWallet(address1),
    fetchAndAnalyzeWallet(address2)
  ]);
  return res.json({ wallet1, wallet2 });
}));

export default router;