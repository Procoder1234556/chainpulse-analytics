/**
 * Tier-aware in-memory rate limiter.
 *
 * Uses a per-identity sliding window (1 minute).
 * Identity = req.user.id if authenticated, otherwise the remote IP.
 *
 * Limits:
 *   PRO  → walletAnalyze: 50/min, alerts: 20/min
 *   FREE → walletAnalyze: 10/min, alerts:  5/min
 */

/** @type {Map<string, number[]>} identity → array of request timestamps (ms) */
const requestLog = new Map();

const WINDOW_MS = 60 * 1000; // 1 minute

const LIMITS = {
  walletAnalyze: { FREE: 10, PRO: 50 },
  alerts:        { FREE:  5, PRO: 20 },
};

/**
 * Factory that returns an Express middleware enforcing the given limit key.
 *
 * @param {"walletAnalyze"|"alerts"} limitKey
 */
export function createTierRateLimiter(limitKey) {
  return function tierRateLimiter(req, res, next) {
    const now = Date.now();

    // Determine identity: authenticated userId preferred, fallback to IP
    const identity =
      req.user?.id ||
      req.ip ||
      req.connection?.remoteAddress ||
      "unknown";

    const tier = req.user?.tier === "PRO" ? "PRO" : "FREE";
    const limit = LIMITS[limitKey][tier];

    const windowKey = `${limitKey}:${identity}`;
    const timestamps = requestLog.get(windowKey) || [];

    // Prune entries older than 1 minute
    const recent = timestamps.filter((ts) => now - ts < WINDOW_MS);

    if (recent.length >= limit) {
      const resetInSeconds = Math.ceil(
        (WINDOW_MS - (now - recent[0])) / 1000
      );
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader("X-RateLimit-Remaining", 0);
      res.setHeader("X-RateLimit-Reset", resetInSeconds);
      return res.status(429).json({
        error: `Rate limit exceeded. ${tier === "FREE" ? "Upgrade to PRO for higher limits." : "Try again shortly."}`,
        retryAfterSeconds: resetInSeconds,
        tier,
        limit,
      });
    }

    recent.push(now);
    requestLog.set(windowKey, recent);

    // Expose helpful headers
    res.setHeader("X-RateLimit-Limit", limit);
    res.setHeader("X-RateLimit-Remaining", limit - recent.length);

    next();
  };
}
