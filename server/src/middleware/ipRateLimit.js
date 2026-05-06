import rateLimit from "express-rate-limit";

/**
 * IP-based rate limiters using express-rate-limit.
 * Returns 429 with { error: "Too many requests" }.
 */

export const analyzeIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: "Too many requests" }),
});

export const createAlertIpLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, res) => res.status(429).json({ error: "Too many requests" }),
});