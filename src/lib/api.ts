const API_URL = import.meta.env.VITE_API_URL;

export type WalletType = "Trader" | "Protocol" | "Whale" | string;

export interface ApiTransaction {
  time: string;
  program: string;
  solChange: number;
  token: string;
  type: "swap" | "transfer" | "stake" | string;
}

export interface AnalyzeWalletResponse {
  transactions: ApiTransaction[];
  brief: string;
  walletType: WalletType;
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });

  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  return res.json() as Promise<T>;
}

export async function analyzeWallet(address: string): Promise<AnalyzeWalletResponse> {
  return request<AnalyzeWalletResponse>("/wallet/analyze", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export async function createAlert(
  address: string,
  chatId: string,
): Promise<{ success: boolean; id?: string }> {
  return request<{ success: boolean; id?: string }>("/alerts/create", {
    method: "POST",
    body: JSON.stringify({ address, chatId }),
  });
}