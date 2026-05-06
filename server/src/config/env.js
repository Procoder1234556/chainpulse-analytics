/**
 * Centralized environment configuration.
 * All process.env references for the server live here.
 *
 * Startup validation ensures the server fails fast with a clear
 * error message rather than silently misbehaving at runtime.
 */

const REQUIRED = [
  "HELIUS_KEY",
  "JWT_SECRET",
];

for (const key of REQUIRED) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const PORT               = process.env.PORT               || "3001";
export const HELIUS_KEY         = process.env.HELIUS_KEY;
export const ANTHROPIC_KEY      = process.env.ANTHROPIC_KEY;
export const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
export const RAZORPAY_KEY_ID    = process.env.RAZORPAY_KEY_ID    || "rzp_test_placeholder";
export const RAZORPAY_SECRET    = process.env.RAZORPAY_SECRET    || "secret_placeholder";
export const JWT_SECRET         = process.env.JWT_SECRET;
export const FRONTEND_URL       = process.env.FRONTEND_URL       || "http://localhost:5173";
