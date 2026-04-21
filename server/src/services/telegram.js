import fetch from "node-fetch";

/**
 * Send a Telegram message to the given chat.
 *
 * @param {string|number} chatId
 * @param {string} message HTML-formatted message body.
 * @returns {Promise<object>} Telegram API result payload.
 */
export async function sendAlert(chatId, message) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN is not configured");
  if (!chatId) throw new Error("chatId is required");

  const url = `https://api.telegram.org/bot${token}/sendMessage`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: message,
      parse_mode: "HTML",
    }),
  });

  const data = await res.json();
  if (!res.ok || data?.ok === false) {
    throw new Error(`Telegram sendMessage failed [${res.status}]: ${JSON.stringify(data)}`);
  }

  return data.result;
}