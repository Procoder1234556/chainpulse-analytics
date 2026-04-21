import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ALERTS_FILE = path.resolve(__dirname, "../../data/alerts.json");

let writeQueue = Promise.resolve();

async function ensureFile() {
  try {
    await fs.access(ALERTS_FILE);
  } catch {
    await fs.mkdir(path.dirname(ALERTS_FILE), { recursive: true });
    await fs.writeFile(ALERTS_FILE, "[]", "utf8");
  }
}

export async function readAlerts() {
  await ensureFile();
  const raw = await fs.readFile(ALERTS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeAlerts(alerts) {
  // Serialize writes to avoid races between request handlers and the watcher job
  writeQueue = writeQueue.then(async () => {
    await ensureFile();
    await fs.writeFile(ALERTS_FILE, JSON.stringify(alerts, null, 2), "utf8");
  });
  return writeQueue;
}

export function newAlertId() {
  return crypto.randomUUID();
}