import { readAlerts, writeAlerts } from "../lib/alertsStore.js";
import { fetchWalletTransactions } from "../services/helius.js";
import { sendAlert } from "../services/telegram.js";

const POLL_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const FRESHNESS_WINDOW_MS = 5 * 60 * 1000; // only alert on tx <= 5 min old

/**
 * Best-effort parse of a relative time string from helius.js
 * (e.g. "30s ago", "4m ago", "2h ago", "1d ago") into a millisecond delta.
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
  // helius.js doesn't surface the raw signature; build a stable fingerprint
  // from the normalized fields that uniquely identify a tx for this wallet.
  return [tx.time, tx.program, tx.type, tx.solChange, tx.token].join("|");
}

async function tick() {
  let alerts;
  try {
    alerts = await readAlerts();
  } catch (err) {
    console.error("[watchWallets] failed to read alerts:", err?.message || err);
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

      // skip if we already alerted on this tx
      if (alert.lastSignature === signature) continue;

      const ageMs = ageMsFromRelative(latest.time);
      if (ageMs > FRESHNESS_WINDOW_MS) {
        // record signature anyway so we don't keep re-checking the same stale tx
        alert.lastSignature = signature;
        mutated = true;
        continue;
      }

      const sign = latest.solChange >= 0 ? "+" : "";
      const message =
        `🚨 <b>ChainPulse Alert</b>\n` +
        `Wallet: <code>${shortAddr(alert.address)}</code>\n` +
        `New activity detected: ${latest.program} ${latest.type} ${sign}${latest.solChange} SOL`;

      try {
        await sendAlert(alert.chatId, message);
        alert.lastSignature = signature;
        mutated = true;
        console.log(`[watchWallets] alerted ${alert.chatId} for ${alert.address}`);
      } catch (sendErr) {
        console.error("[watchWallets] sendAlert failed:", sendErr?.message || sendErr);
      }
    } catch (err) {
      console.error(
        `[watchWallets] error for ${alert.address}:`,
        err?.response?.data || err?.message || err,
      );
    }
  }

  if (mutated) {
    try {
      // re-read to merge with any concurrent route writes, then patch lastSignature for our ids
      const fresh = await readAlerts();
      const byId = new Map(fresh.map((a) => [a.id, a]));
      for (const a of active) {
        const target = byId.get(a.id);
        if (target) target.lastSignature = a.lastSignature;
      }
      await writeAlerts(Array.from(byId.values()));
    } catch (err) {
      console.error("[watchWallets] failed to persist signatures:", err?.message || err);
    }
  }
}

export function startWatchWallets() {
  console.log(
    `[watchWallets] starting wallet watcher — polling every ${POLL_INTERVAL_MS / 1000}s`,
  );
  // fire once shortly after boot, then on interval
  setTimeout(() => {
    tick().catch((err) => console.error("[watchWallets] tick error:", err));
  }, 10_000);

  return setInterval(() => {
    tick().catch((err) => console.error("[watchWallets] tick error:", err));
  }, POLL_INTERVAL_MS);
}