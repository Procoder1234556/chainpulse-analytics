import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "recent_wallets";
const MAX_RECENT = 5;

export function useRecentWallets() {
  const [recents, setRecents] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recents));
    } catch {
      // ignore storage errors
    }
  }, [recents]);

  const addRecent = useCallback((address: string) => {
    setRecents((prev) => {
      // Deduplicate: remove existing entry, prepend new one, cap at MAX_RECENT
      const deduped = prev.filter((a) => a !== address);
      return [address, ...deduped].slice(0, MAX_RECENT);
    });
  }, []);

  return { recents, addRecent };
}
