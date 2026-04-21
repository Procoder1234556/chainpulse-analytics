import axios from "axios";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

const SYSTEM_PROMPT =
  "You are an on-chain analyst for Solana. Given wallet transaction history, write a 3-paragraph brief: 1) wallet behavior pattern and trader type 2) notable moves in last 24h with specific program names 3) what this wallet appears to be positioning for. Be specific. Max 150 words. No bullet points.";

/**
 * Generate an analyst-style wallet brief from a list of normalized transactions.
 *
 * @param {Array<object>} transactions
 * @returns {Promise<string>} The generated brief text.
 */
export async function generateWalletBrief(transactions) {
  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) throw new Error("ANTHROPIC_KEY is not configured");

  const { data } = await axios.post(
    ANTHROPIC_URL,
    {
      model: "claude-sonnet-4-20250514",
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: "Analyze this wallet: " + JSON.stringify(transactions),
        },
      ],
    },
    {
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      timeout: 30_000,
    },
  );

  const text = data?.content?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new Error("Unexpected Anthropic response shape");
  }

  return text;
}