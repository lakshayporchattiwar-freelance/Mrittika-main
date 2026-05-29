import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabaseClient.js";
import { optionalAuth } from "../middleware/auth.js";

const router = Router();

const orderSchema = z.object({
  items: z
    .array(
      z.object({
        product_id: z.string().min(1),
        quantity: z.number().int().positive(),
        price: z.number().positive(),
      })
    )
    .min(1),
  shipping: z.object({
    name: z.string().min(1),
    phone: z.string().min(6),
    address_line1: z.string().min(1),
    address_line2: z.string().optional().default(""),
    city: z.string().min(1),
    state: z.string().min(1),
    postal_code: z.string().min(4),
    country: z.string().min(1),
  }),
  payment_method: z.enum(["razorpay", "cod"]),
  totals: z.object({
    subtotal: z.number().positive(),
    shipping: z.number().nonnegative(),
    total: z.number().positive(),
  }),
});

router.post("/", optionalAuth, async (req, res, next) => {
  try {
    const payload = orderSchema.parse(req.body);
    const { items, shipping, payment_method, totals } = payload;

    const { data: order, error } = await supabase
      .from("orders")
      .insert({
        user_id: req.user?.sub ?? null,
        status: "pending",
        payment_method,
        subtotal: totals.subtotal,
        shipping_amount: totals.shipping,
        total_amount: totals.total,
        shipping_name: shipping.name,
        shipping_phone: shipping.phone,
        shipping_address1: shipping.address_line1,
        shipping_address2: shipping.address_line2,
        shipping_city: shipping.city,
        shipping_state: shipping.state,
        shipping_postal_code: shipping.postal_code,
        shipping_country: shipping.country,
      })
      .select("*")
      .single();

    if (error) {
      throw error;
    }

    const orderItems = items.map((item) => ({
      order_id: order.id,
      product_id: item.product_id,
      quantity: item.quantity,
      price: item.price,
    }));

    const { error: itemsError } = await supabase.from("order_items").insert(orderItems);
    if (itemsError) {
      throw itemsError;
    }

    res.status(201).json(order);
  } catch (error) {
    next(error);
  }
});

export default router;
