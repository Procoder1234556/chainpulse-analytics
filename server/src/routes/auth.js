import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { readUsers, writeUsers, newUserId } from "../lib/usersStore.js";
import { authMiddleware } from "../middleware/auth.js";
import { JWT_SECRET } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.post("/signup", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const users = await readUsers();
  if (users.find(u => u.email === email)) {
    return res.status(400).json({ error: "User already exists" });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: newUserId(),
    email,
    passwordHash,
    tier: "FREE" // Default tier = FREE
  };

  users.push(user);
  await writeUsers(users);

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token }); // Returning just { token } as requested
}));

router.post("/login", asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "email and password are required" });
  }

  const users = await readUsers();
  const user = users.find(u => u.email === email);
  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: "7d" });
  res.json({ token, user: { id: user.id, email: user.email, tier: user.tier } });
}));

router.get("/me", authMiddleware, asyncHandler(async (req, res) => {
  res.json({ user: { id: req.user.id, email: req.user.email, tier: req.user.tier } });
}));

export default router;
