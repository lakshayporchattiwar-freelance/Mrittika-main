import { Router } from "express";
import crypto from "crypto";
import Razorpay from "razorpay";
import { z } from "zod";
import { env } from "../config.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

let razorpay = null;
if (env.RAZORPAY_KEY_ID && env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: env.RAZORPAY_KEY_ID,
    key_secret: env.RAZORPAY_KEY_SECRET,
  });
}

const orderSchema = z.object({
  amount: z.number().positive(),
  currency: z.string().default("INR"),
  receipt: z.string().min(1),
});

router.post("/razorpay/order", optionalAuth, async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        error: "Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }
    const payload = orderSchema.parse(req.body);
    const order = await razorpay.orders.create({
      amount: Math.round(payload.amount * 100),
      currency: payload.currency,
      receipt: payload.receipt,
      payment_capture: 1,
    });
    res.json(order);
  } catch (error) {
    next(error);
  }
});

const verifySchema = z.object({
  order_id: z.string().min(1),
  payment_id: z.string().min(1),
  signature: z.string().min(1),
});

router.post("/razorpay/verify", optionalAuth, async (req, res, next) => {
  try {
    if (!razorpay) {
      return res.status(503).json({
        error: "Razorpay not configured. Please add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
      });
    }
    const payload = verifySchema.parse(req.body);
    const sign = `${payload.order_id}|${payload.payment_id}`;
    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expected !== payload.signature) {
      res.status(400).json({ error: "Invalid payment signature" });
      return;
    }

    res.json({ status: "verified" });
  } catch (error) {
    next(error);
  }
});

export default router;
