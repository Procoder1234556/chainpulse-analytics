// Load environment variables from the correct .env file BEFORE any other imports.
// ES-module top-level await is not available for dynamic dotenv, so we use the
// synchronous dotenv.config() via a createRequire shim — compatible with "type":"module".
import { createRequire } from "node:module";
const _require = createRequire(import.meta.url);
const dotenv = _require("dotenv");

const NODE_ENV = process.env.NODE_ENV || "development";
dotenv.config({ path: new URL(`../../.env.${NODE_ENV}`, import.meta.url).pathname });

import { logger } from "./utils/logger.js";

logger.info(`Running in ${NODE_ENV} mode`);
logger.info("Environment loaded successfully");

import express from "express";
import cors from "cors";
import morgan from "morgan";
import { PORT, FRONTEND_URL } from "./config/env.js";

import walletRoutes from "./routes/wallet.js";
import alertsRoutes from "./routes/alerts.js";
import authRoutes from "./routes/auth.js";
import paymentsRoutes from "./routes/payments.js";
import { startWatchWallets } from "./jobs/watchWallets.js";
import { getAnalytics } from "./services/analytics.js";

const app = express();

const allowedOrigins = [
  "http://localhost:5173",
  FRONTEND_URL
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);
app.use(express.json({ limit: "1mb" }));

// HTTP request logging: METHOD URL STATUS response-time → piped into winston
app.use(
  morgan(":method :url :status :res[content-length] - :response-time ms", {
    stream: { write: (msg) => logger.info(msg.trim()) },
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/analytics", (_req, res) => {
  res.json(getAnalytics());
});

app.use("/wallet", walletRoutes);
app.use("/auth", authRoutes);
app.use("/alerts", alertsRoutes);
app.use("/payments", paymentsRoutes);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Error handler
app.use((err, _req, res, _next) => {
  logger.error("[server error]", { message: err?.message, stack: err?.stack });
  res.status(500).json({ error: err?.message || "Internal server error" });
});

app.listen(PORT, () => {
  logger.info(`Server listening on http://localhost:${PORT}`);
  startWatchWallets();
});