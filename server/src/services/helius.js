import axios from "axios";

const HELIUS_BASE = "https://api.helius.xyz/v0";

/**
 * Format a unix timestamp (seconds) as a relative "Xs/m/h/d ago" string.
 */
function formatRelativeTime(timestampSeconds) {
  if (!timestampSeconds || typeof timestampSeconds !== "number") return "—";

  const nowMs = Date.now();
  const thenMs = timestampSeconds * 1000;
  const diffSec = Math.max(0, Math.floor((nowMs - thenMs) / 1000));

  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

/**
 * Pick a human-readable program label.
 * Prefers the Helius `description`, falls back to first accountData entry.
 */
function extractProgram(tx) {
  if (tx.description && typeof tx.description === "string" && tx.description.trim()) {
    return tx.description.length > 80
      ? `${tx.description.slice(0, 80)}…`
      : tx.description;
  }

  const firstAccount = Array.isArray(tx.accountData) ? tx.accountData[0] : null;
  if (firstAccount?.account) {
    const acc = firstAccount.account;
    return `${acc.slice(0, 4)}…${acc.slice(-4)}`;
  }

  return tx.source || "Unknown";
}

/**
 * Sum nativeTransfers (in lamports) for the fee payer of the tx.
 * Returns SOL change as a float (positive = inflow, negative = outflow).
 */
function extractSolChange(tx) {
  const lamportsPerSol = 1_000_000_000;
  const feePayer = tx.feePayer;
  const transfers = Array.isArray(tx.nativeTransfers) ? tx.nativeTransfers : [];

  if (!feePayer || transfers.length === 0) return 0;

  let lamports = 0;
  for (const t of transfers) {
    if (t.toUserAccount === feePayer) lamports += Number(t.amount) || 0;
    if (t.fromUserAccount === feePayer) lamports -= Number(t.amount) || 0;
  }

  return Number((lamports / lamportsPerSol).toFixed(4));
}

/**
 * Pick the primary token symbol/identifier for the tx.
 * Uses the last 4 chars of the first tokenTransfers mint, or "SOL".
 */
function extractToken(tx) {
  const tokenTransfers = Array.isArray(tx.tokenTransfers) ? tx.tokenTransfers : [];
  const first = tokenTransfers[0];
  if (first?.mint && typeof first.mint === "string") {
    return first.mint.slice(-4);
  }
  return "SOL";
}

function extractType(tx) {
  if (typeof tx.type === "string" && tx.type.trim()) return tx.type;
  return "UNKNOWN";
}

/**
 * Fetch and normalize wallet transactions from Helius Enhanced Transactions API.
 *
 * @param {string} address Solana wallet address
 * @returns {Promise<Array<{ time: string, program: string, solChange: number, token: string, type: string }>>}
 */
export async function fetchWalletTransactions(address) {
  const apiKey = process.env.HELIUS_KEY;
  if (!apiKey) throw new Error("HELIUS_KEY is not configured");
  if (!address || typeof address !== "string") {
    throw new Error("address is required");
  }

  const url = `${HELIUS_BASE}/addresses/${encodeURIComponent(address)}/transactions`;

  const { data } = await axios.get(url, {
    params: {
      "api-key": apiKey,
      limit: 20,
      type: "SWAP,TRANSFER",
    },
    timeout: 15_000,
  });

  if (!Array.isArray(data)) return [];

  return data.map((tx) => ({
    time: formatRelativeTime(tx.timestamp),
    program: extractProgram(tx),
    solChange: extractSolChange(tx),
    token: extractToken(tx),
    type: extractType(tx),
  }));
}