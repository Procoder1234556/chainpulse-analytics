const API_URL = import.meta.env.VITE_API_URL;

export type WalletType = "Trader" | "Protocol" | "Whale" | string;

export interface ApiTransaction {
  time: string;
  program: string;
  solChange: number;
  token: string;
  type: "swap" | "transfer" | "stake" | string;
  mint: string | null;
  buyAmount: number | null;
  sellAmount: number | null;
  pnl: number | null;
}

export interface AnalyzeWalletResponse {
  transactions: ApiTransaction[];
  brief: string;
  walletType: WalletType;
  tags?: string[];
  totalPnL?: number;
  winRate?: number;
  isAlpha?: boolean;
  copyHint?: string;
}

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error("VITE_API_URL is not configured");
  }

  const token = localStorage.getItem("token");
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { ...headers, ...(init.headers || {}) },
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

    return await res.json() as T;
  } catch (err: any) {
    // If it's already an Error with a specific message from the server, rethrow
    if (err instanceof Error && !err.message.includes("failed to fetch") && !err.message.includes("NetworkError")) {
      throw err;
    }
    // Otherwise, it's a network/system failure
    throw new Error("Service temporarily unavailable");
  }
}

export async function analyzeWallet(address: string): Promise<AnalyzeWalletResponse> {
  return request<AnalyzeWalletResponse>("/wallet/analyze", {
    method: "POST",
    body: JSON.stringify({ address }),
  });
}

export interface CompareWalletsResponse {
  wallet1: AnalyzeWalletResponse;
  wallet2: AnalyzeWalletResponse;
}

export async function compareWallets(address1: string, address2: string): Promise<CompareWalletsResponse> {
  return request<CompareWalletsResponse>("/wallet/compare", {
    method: "POST",
    body: JSON.stringify({ address1, address2 }),
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

export async function createPaymentOrder() {
  return request<{ id: string; amount: number; currency: string; }>("/payments/create-order", {
    method: "POST"
  });
}

export async function verifyPayment(
  razorpay_order_id: string,
  razorpay_payment_id: string,
  razorpay_signature: string
) {
  return request<{ success: boolean }>("/payments/verify", {
    method: "POST",
    body: JSON.stringify({ razorpay_order_id, razorpay_payment_id, razorpay_signature })
  });
}

export async function getMe() {
  return request<{ user: { id: string, email: string, tier: string } }>("/auth/me", { method: "GET" });
}

export async function autoSignup() {
  const data = await request<{ token?: string }>("/auth/signup", {
    method: "POST",
    body: JSON.stringify({ email: `test_${Date.now()}@test.com`, password: "password" })
  });
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  return data;
}

export async function getTrendingWallets() {
  return request<{ address: string; views: number }[]>("/wallet/trending", {
    method: "GET"
  });
}

export async function getPublicWallet(address: string) {
  return request<{ walletType: string, brief: string, tags: string[] }>(`/wallet/public/${address}`, {
    method: "GET"
  });
}