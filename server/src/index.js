import "dotenv/config";
import express from "express";
import cors from "cors";

import walletRoutes from "./routes/wallet.js";
import alertsRoutes from "./routes/alerts.js";

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/wallet", walletRoutes);
app.use("/alerts", alertsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  console.error("[server error]", err);
  res.status(500).json({ error: err?.message || "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`ChainPulse server listening on http://localhost:${PORT}`);
});