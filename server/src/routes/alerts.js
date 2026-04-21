import { Router } from "express";
import { newAlertId, readAlerts, writeAlerts } from "../lib/alertsStore.js";
import { incrementAlertsCreated } from "../services/analytics.js";
import { authMiddleware } from "../middleware/auth.js";
import { createTierRateLimiter } from "../middleware/rateLimiter.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const alertsRateLimit = createTierRateLimiter("alerts");

// Auth runs first (populates req.user), then rate limiter uses tier info
router.use(authMiddleware);
router.use(alertsRateLimit);

router.get("/list", asyncHandler(async (req, res) => {
  const alerts = await readAlerts();
  const userAlerts = alerts.filter(a => a.userId === req.user.id);
  return res.json(userAlerts);
}));

router.post("/create", asyncHandler(async (req, res) => {
  const { address, chatId, minSolThreshold } = req.body || {};

  if (!address || !chatId) {
    return res.status(400).json({ error: "address and chatId are required" });
  }

  const alerts = await readAlerts();
  
  // Check tier limits
  const userAlerts = alerts.filter(a => a.userId === req.user.id);
  const tierLimit = req.user.tier === "PRO" ? 20 : 2;
  
  if (userAlerts.length >= tierLimit) {
    return res.status(403).json({ error: "Upgrade to PRO for more alerts" });
  }

  const alert = {
    id: newAlertId(),
    userId: req.user.id,
    address: String(address),
    chatId: String(chatId),
    active: true,
    lastSignature: null,
    minSolThreshold: typeof minSolThreshold === "number" ? minSolThreshold : 1,
    avgSolChange: 0,
    knownTokens: [],
    createdAt: new Date().toISOString(),
  };
  alerts.push(alert);
  await writeAlerts(alerts);
  incrementAlertsCreated();

  return res.json({ success: true, id: alert.id });
}));

router.delete("/:id", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alerts = await readAlerts();
  const next_ = alerts.filter((a) => !(a.id === id && a.userId === req.user.id));

  if (next_.length === alerts.length) {
    return res.status(404).json({ error: "alert not found" });
  }

  await writeAlerts(next_);
  return res.json({ success: true });
}));

router.patch("/:id/toggle", asyncHandler(async (req, res) => {
  const { id } = req.params;
  const alerts = await readAlerts();
  const alert = alerts.find((a) => a.id === id && a.userId === req.user.id);

  if (!alert) {
    return res.status(404).json({ error: "alert not found" });
  }

  alert.active = !alert.active;
  await writeAlerts(alerts);
  return res.json({ success: true, active: alert.active });
}));

export default router;