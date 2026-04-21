import { Router } from "express";
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { authMiddleware } from "../middleware/auth.js";
import { readUsers, writeUsers } from "../lib/usersStore.js";
import { RAZORPAY_KEY_ID, RAZORPAY_SECRET } from "../config/env.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

const razorpay = new Razorpay({
  key_id: RAZORPAY_KEY_ID,
  key_secret: RAZORPAY_SECRET,
});

router.use(authMiddleware);

router.post("/create-order", asyncHandler(async (req, res) => {
  const options = {
    amount: 299 * 100, // ₹299 in paise
    currency: "INR",
    receipt: `receipt_order_${req.user.id}_${Date.now()}`,
  };

  const order = await razorpay.orders.create(options);
  
  // Only return the necessary frontend-safe info
  res.json({
    id: order.id,
    amount: order.amount,
    currency: order.currency
  });
}));

router.post("/verify", asyncHandler(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({ error: "Missing required payment details" });
  }

  const secret = RAZORPAY_SECRET;

  const body = razorpay_order_id + "|" + razorpay_payment_id;
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature === razorpay_signature) {
    // Payment verified, upgrade user
    const users = await readUsers();
    const userIndex = users.findIndex(u => u.id === req.user.id);
    
    if (userIndex === -1) {
      return res.status(404).json({ error: "User not found" });
    }

    users[userIndex].tier = "PRO";
    await writeUsers(users);

    return res.json({ success: true, message: "Upgraded to PRO successful" });
  } else {
    return res.status(400).json({ error: "Invalid payment signature" });
  }
}));

export default router;
