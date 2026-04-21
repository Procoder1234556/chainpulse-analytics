import { Router } from "express";

const router = Router();

router.post("/create", (req, res) => {
  const { address, chatId } = req.body || {};

  if (!address || !chatId) {
    return res.status(400).json({ error: "address and chatId are required" });
  }

  return res.json({ success: true });
});

router.get("/list", (_req, res) => {
  return res.json([]);
});

export default router;