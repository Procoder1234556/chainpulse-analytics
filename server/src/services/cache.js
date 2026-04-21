const cache = new Map();
const TTL = 2 * 60 * 1000; // 2 minutes in milliseconds

export function getCachedWallet(address) {
  const cached = cache.get(address);
  if (!cached) return null;

  const now = Date.now();
  if (now - cached.timestamp > TTL) {
    cache.delete(address);
    return null;
  }

  return cached.data;
}

export function setCachedWallet(address, data) {
  cache.set(address, {
    data,
    timestamp: Date.now()
  });
}
