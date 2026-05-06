# ChainPulse Analytics Backend

A high-performance Solana wallet analytics engine and alerting system.

## Features
- Deep wallet transaction analysis via Helius RPC.
- PnL estimation and ALPHA score generation.
- Real-time unusual activity monitoring and Telegram alerts.
- Tier-aware rate limiting (FREE vs PRO).
- Integrated payments via Razorpay.

## Development
1. `npm install`
2. Create `.env.development` (see `.env.example`).
3. `npm run dev`

## Deployment
1. Set up your environment variables (see `.env.production.example`).
2. Run `npm install` to install production dependencies.
3. Build/Prepare your environment.
4. Run `npm start` to initiate the server in production mode.

> [!IMPORTANT]
> Ensure `HELIUS_KEY` and `JWT_SECRET` are set in your production environment, or the server will fail to start for security reasons.

## Stack
- Node.js / Express
- Winston / Morgan (Logging)
- Helius (Blockchain Data)
- Razorpay (Payments)
