import { readAlerts, writeAlerts } from "../lib/alertsStore.js";
import { fetchWalletTransactions } from "../services/helius.js";
import { sendAlert } from "../services/telegram.js";
import { logger } from "../utils/logger.js";

const POLL_INTERVAL_MS = 5 * 60 * 1000;      // 5 minutes
const FRESHNESS_WINDOW_MS = 5 * 60 * 1000;   // only alert on tx <= 5 min old
const SPIKE_WINDOW_MS = 5 * 60 * 1000;       // window for spike detection

/**
 * Best-effort parse of a relative time string from helius.js
 * (e.g. "30s ago", "4m ago") into a millisecond delta.
 * Returns Infinity if it can't parse, so unknown ages are NOT alerted.
 */
function ageMsFromRelative(time) {
  if (typeof time !== "string") return Infinity;
  const m = time.match(/^(\d+)\s*(s|m|h|d)\s*ago$/i);
  if (!m) return Infinity;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  const mult =
    unit === "s" ? 1000 :
    unit === "m" ? 60_000 :
    unit === "h" ? 60 * 60_000 :
    24 * 60 * 60_000;
  return n * mult;
}

function shortAddr(addr) {
  if (typeof addr !== "string" || addr.length < 10) return addr;
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`;
}

function buildSignature(tx) {
  return [tx.time, tx.program, tx.type, tx.solChange, tx.token].join("|");
}

// ─── Unusual activity detection ───────────────────────────────────────────────

/**
 * Update the running average SOL change stored on the alert object.
 * Uses an exponential moving average (alpha = 0.3) to weight recent data.
 */
function updateAvgSolChange(alert, solChange) {
  const abs = Math.abs(solChange);
  if (typeof alert.avgSolChange !== "number") {
    alert.avgSolChange = abs;
  } else {
    // EMA: new_avg = 0.3 * latest + 0.7 * old_avg
    alert.avgSolChange = Number((0.3 * abs + 0.7 * alert.avgSolChange).toFixed(4));
  }
}

/**
 * Detect if the given transactions represent a sudden spike:
 * > 5 txns with age < 5 minutes.
 */
function detectSpike(txs) {
  const recentCount = txs.filter(tx => ageMsFromRelative(tx.time) <= SPIKE_WINDOW_MS).length;
  return recentCount > 5 ? recentCount : 0;
}

/**
 * Run all unusual-activity checks. Returns an array of reason strings
 * (empty = nothing unusual detected).
 *
 * @param {object} alert  The alert object from alerts.json (mutated in place)
 * @param {object} latest The freshest transaction
 * @param {Array}  allTxs All transactions fetched this tick
 */
function detectUnusualActivity(alert, latest, allTxs) {
  const reasons = [];

  // ── 1. SolChange > 3× historical average ───────────────────────────────
  const absSolChange = Math.abs(latest.solChange || 0);
  if (
    typeof alert.avgSolChange === "number" &&
    alert.avgSolChange > 0 &&
    absSolChange > 3 * alert.avgSolChange
  ) {
    const multiple = (absSolChange / alert.avgSolChange).toFixed(1);
    reasons.push(
      `SOL impact ${absSolChange} SOL is ${multiple}× the historical average (${alert.avgSolChange} SOL)`
    );
  }

  // ── 2. New token interaction ────────────────────────────────────────────
  const token = latest.token;
  if (token && token !== "SOL") {
    if (!Array.isArray(alert.knownTokens)) alert.knownTokens = [];
    if (!alert.knownTokens.includes(token)) {
      reasons.push(`First interaction with token ${token} — never seen before for this wallet`);
      alert.knownTokens.push(token);
    }
  }

  // ── 3. Sudden spike (>5 txns within 5 min) ─────────────────────────────
  const spikeCount = detectSpike(allTxs);
  if (spikeCount > 0) {
    reasons.push(`Sudden activity spike — ${spikeCount} transactions in the last 5 minutes`);
  }

  return reasons;
}

// ─── Main tick ────────────────────────────────────────────────────────────────

async function tick() {
  let alerts;
  try {
    alerts = await readAlerts();
  } catch (err) {
    logger.error("[watchWallets] failed to read alerts", { error: err?.message || err });
    return;
  }

  const active = alerts.filter((a) => a.active);
  if (active.length === 0) return;

  let mutated = false;

  for (const alert of active) {
    try {
      const txs = await fetchWalletTransactions(alert.address);
      if (!Array.isArray(txs) || txs.length === 0) continue;

      const latest = txs[0];
      const signature = buildSignature(latest);

      // Skip if we already alerted on this exact tx
      if (alert.lastSignature === signature) continue;

      const ageMs = ageMsFromRelative(latest.time);
      if (ageMs > FRESHNESS_WINDOW_MS) {
        // Update avg/tokens even for stale txns so history stays warm
        updateAvgSolChange(alert, latest.solChange || 0);
        alert.lastSignature = signature;
        mutated = true;
        continue;
      }

      // ── Update running avg before checking spike ratio ──────────────────
      updateAvgSolChange(alert, latest.solChange || 0);

      // ── Existing smart alert logic (preserved) ──────────────────────────
      const threshold = typeof alert.minSolThreshold === "number" ? alert.minSolThreshold : 1;
      const isSwap = typeof latest.type === "string" && latest.type.toUpperCase() === "SWAP";
      const isHighImpact = Math.abs(latest.solChange || 0) > threshold;

      // ── Unusual activity checks ─────────────────────────────────────────
      const unusualReasons = detectUnusualActivity(alert, latest, txs);

      const shouldSendSmartAlert = isSwap || isHighImpact;
      const shouldSendUnusualAlert = unusualReasons.length > 0;

      if (!shouldSendSmartAlert && !shouldSendUnusualAlert) {
        alert.lastSignature = signature;
        mutated = true;
        continue;
      }

      const sign = latest.solChange >= 0 ? "+" : "";

      // Build one or two messages depending on what fired
      const messages = [];

      if (shouldSendSmartAlert) {
        messages.push(
          `🚨 ChainPulse Smart Alert\n` +
          `Wallet: ${shortAddr(alert.address)}\n` +
          `Action: ${latest.type || "UNKNOWN"}\n` +
          `Program: ${latest.program || "Unknown"}\n` +
          `Impact: ${sign}${latest.solChange} SOL`
        );
      }

      if (shouldSendUnusualAlert) {
        messages.push(
          `⚠️ Unusual Activity Detected\n` +
          `Wallet: ${shortAddr(alert.address)}\n` +
          `Reason: ${unusualReasons.join(" | ")}`
        );
      }

      for (const message of messages) {
        try {
          await sendAlert(alert.chatId, message);
          logger.info(`[watchWallets] alerted ${alert.chatId} for ${alert.address}`);
        } catch (sendErr) {
          logger.error("[watchWallets] sendAlert failed", { error: sendErr?.message || sendErr });
        }
      }

      alert.lastSignature = signature;
      mutated = true;

    } catch (err) {
      logger.error(`[watchWallets] error for ${alert.address}`, {
        error: err?.response?.data || err?.message || err,
      });
    }
  }

  if (mutated) {
    try {
      // Re-read to merge with any concurrent route writes, then patch mutable fields
      const fresh = await readAlerts();
      const byId = new Map(fresh.map((a) => [a.id, a]));
      for (const a of active) {
        const target = byId.get(a.id);
        if (target) {
          target.lastSignature = a.lastSignature;
          target.avgSolChange  = a.avgSolChange;
          target.knownTokens   = a.knownTokens;
        }
      }
      await writeAlerts(Array.from(byId.values()));
    } catch (err) {
      logger.error("[watchWallets] failed to persist state", { error: err?.message || err });
    }
  }
}

export function startWatchWallets() {
  logger.info(`[watchWallets] starting wallet watcher — polling every ${POLL_INTERVAL_MS / 1000}s`);
  setTimeout(() => {
    tick().catch((err) => logger.error("[watchWallets] tick error", { error: err }));
  }, 10_000);

  return setInterval(() => {
    tick().catch((err) => logger.error("[watchWallets] tick error", { error: err }));
  }, POLL_INTERVAL_MS);
}