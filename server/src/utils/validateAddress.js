/**
 * Validates a Solana wallet address: base58, 32-44 chars.
 */
const BASE58_RE = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

export function isValidSolanaAddress(addr) {
  return typeof addr === "string" && BASE58_RE.test(addr);
}

export function validateAddressMiddleware(req, res, next) {
  const address = req.body?.address;
  if (!isValidSolanaAddress(address)) {
    return res.status(400).json({ error: "Invalid Solana address" });
  }
  next();
}