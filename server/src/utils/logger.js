/**
 * Centralized Winston logger.
 *
 * Transports:
 *  - Console  : colourised, human-readable
 *  - File     : /server/logs/app.log (JSON, all levels)
 *
 * Usage:
 *   import { logger } from "../utils/logger.js";
 *   logger.info("message", { extra: "fields" });
 *   logger.error("message", { err });
 */

import winston from "winston";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";

// ── Resolve /server/logs relative to this file ──────────────────────────────
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGS_DIR = path.resolve(__dirname, "../../logs");

// Ensure the logs directory exists at startup
fs.mkdirSync(LOGS_DIR, { recursive: true });

// ── Custom formats ────────────────────────────────────────────────────────────
const { combine, timestamp, errors, printf, colorize, json } = winston.format;

/** Human-readable format for the console */
const consoleFormat = combine(
  colorize({ all: true }),
  timestamp({ format: "HH:mm:ss" }),
  errors({ stack: true }),
  printf(({ level, message, timestamp: ts, ...meta }) => {
    const extras = Object.keys(meta).length
      ? " " + JSON.stringify(meta)
      : "";
    return `${ts} [${level}] ${message}${extras}`;
  })
);

/** Structured JSON format for the log file */
const fileFormat = combine(
  timestamp(),
  errors({ stack: true }),
  json()
);

// ── Logger instance ───────────────────────────────────────────────────────────
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new winston.transports.Console({ format: consoleFormat }),
    new winston.transports.File({
      filename: path.join(LOGS_DIR, "app.log"),
      format: fileFormat,
      maxsize: 10 * 1024 * 1024, // 10 MB
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

export default logger;
