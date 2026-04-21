import { Router } from "express";
import { newAlertId, readAlerts, writeAlerts } from "../lib/alertsStore.js";

const router = Router();

router.get("/list", async (_req, res, next) => {
  try {
    const alerts = await readAlerts();
    return res.json(alerts);
  } catch (err) {
    return next(err);
  }
});

router.post("/create", async (req, res, next) => {
  try {
    const { address, chatId } = req.body || {};

    if (!address || !chatId) {
      return res.status(400).json({ error: "address and chatId are required" });
    }

    const alerts = await readAlerts();
    const alert = {
      id: newAlertId(),
      address: String(address),
      chatId: String(chatId),
      active: true,
      lastSignature: null,
      createdAt: new Date().toISOString(),
    };
    alerts.push(alert);
    await writeAlerts(alerts);

    return res.json({ success: true, id: alert.id });
  } catch (err) {
    return next(err);
  }
});

router.delete("/:id", async (req, res, next) => {
  try {
    const { id } = req.params;
    const alerts = await readAlerts();
    const next_ = alerts.filter((a) => a.id !== id);

    if (next_.length === alerts.length) {
      return res.status(404).json({ error: "alert not found" });
    }

    await writeAlerts(next_);
    return res.json({ success: true });
  } catch (err) {
    return next(err);
  }
});

router.patch("/:id/toggle", async (req, res, next) => {
  try {
    const { id } = req.params;
    const alerts = await readAlerts();
    const alert = alerts.find((a) => a.id === id);

    if (!alert) {
      return res.status(404).json({ error: "alert not found" });
    }

    alert.active = !alert.active;
    await writeAlerts(alerts);
    return res.json({ success: true, active: alert.active });
  } catch (err) {
    return next(err);
  }
});

export default router;