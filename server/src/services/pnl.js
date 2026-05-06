/**
 * PnL estimation from on-chain swap transactions.
 *
 * Strategy:
 *  - Group SWAP transactions by token mint.
 *  - For each mint, track cumulative SOL spent (buys) vs SOL received (sells).
 *  - A "buy" is when solChange < 0 (SOL left the wallet → bought tokens).
 *  - A "sell" is when solChange > 0 (SOL entered the wallet → sold tokens).
 *  - Per-tx pnl is approximated from solChange direction:
 *      buy  → pnl = 0 (cost basis recorded)
 *      sell → pnl = solChange + average cost per token × sellAmount
 *
 * Because Helius doesn't provide oracle prices, we estimate solely from the
 * SOL flow, which is exact for SOL-paired DEX swaps (Jupiter/Orca/Raydium).
 *
 * Each transaction gets a `pnl` field (number | null).
 * Summary: { totalPnL, winRate }
 */

/**
 * @param {Array<{ type: string, solChange: number, mint: string|null, buyAmount: number|null, sellAmount: number|null }>} transactions
 * @returns {{ transactions: Array, totalPnL: number, winRate: number }}
 */
export function calculatePnL(transactions) {
  // mint → { totalSolSpent, totalTokensBought }
  const costBasis = new Map();

  const annotated = transactions.map((tx) => {
    const type = (tx.type || "").toUpperCase();

    // Only estimate PnL for SWAP transactions with valid swap details
    if (type !== "SWAP" || tx.mint === null) {
      return { ...tx, pnl: null };
    }

    const { mint, buyAmount, sellAmount, solChange } = tx;

    let pnl = null;

    if (solChange < 0) {
      // ── BUY ──────────────────────────────────────────────────────────────
      // SOL left wallet → purchased tokens. Record cost basis.
      const existing = costBasis.get(mint) || { totalSolSpent: 0, totalTokensBought: 0 };
      existing.totalSolSpent += Math.abs(solChange);
      existing.totalTokensBought += buyAmount || 0;
      costBasis.set(mint, existing);
      pnl = 0; // Cost recorded, realised PnL = 0 at buy time
    } else if (solChange > 0 && sellAmount) {
      // ── SELL ─────────────────────────────────────────────────────────────
      // SOL entered wallet → sold tokens. Realise PnL.
      const basis = costBasis.get(mint);
      if (basis && basis.totalTokensBought > 0) {
        const avgCostPerToken = basis.totalSolSpent / basis.totalTokensBought;
        const costOfSold = avgCostPerToken * sellAmount;
        pnl = Number((solChange - costOfSold).toFixed(4));

        // Reduce remaining basis proportionally
        const fractionSold = Math.min(sellAmount / basis.totalTokensBought, 1);
        basis.totalTokensBought -= sellAmount;
        basis.totalSolSpent -= basis.totalSolSpent * fractionSold;
        costBasis.set(mint, basis);
      } else {
        // No basis recorded (sell-only in window) — treat solChange as gain
        pnl = Number(solChange.toFixed(4));
      }
    }

    return { ...tx, pnl };
  });

  // ── Summary ───────────────────────────────────────────────────────────────
  const realisedTrades = annotated.filter(
    (tx) => tx.pnl !== null && tx.pnl !== 0
  );

  const totalPnL = Number(
    realisedTrades.reduce((sum, tx) => sum + (tx.pnl || 0), 0).toFixed(4)
  );

  const wins = realisedTrades.filter((tx) => (tx.pnl || 0) > 0).length;
  const winRate = realisedTrades.length > 0
    ? Math.round((wins / realisedTrades.length) * 100)
    : 0;

  return { transactions: annotated, totalPnL, winRate };
}
