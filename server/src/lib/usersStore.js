import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const USERS_FILE = path.resolve(__dirname, "../../data/users.json");

let writeQueue = Promise.resolve();

async function ensureFile() {
  try {
    await fs.access(USERS_FILE);
  } catch {
    await fs.mkdir(path.dirname(USERS_FILE), { recursive: true });
    await fs.writeFile(USERS_FILE, "[]", "utf8");
  }
}

export async function readUsers() {
  await ensureFile();
  const raw = await fs.readFile(USERS_FILE, "utf8");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeUsers(users) {
  writeQueue = writeQueue.then(async () => {
    await ensureFile();
    await fs.writeFile(USERS_FILE, JSON.stringify(users, null, 2), "utf8");
  });
  return writeQueue;
}

export function newUserId() {
  return crypto.randomUUID();
}
