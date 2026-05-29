import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabaseClient.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

const productSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().min(1),
  price: z.number().positive(),
  mrp: z.number().positive(),
  badge: z.string().optional(),
  category: z.string().optional(),
  image_url: z.string().url().optional(),
});

router.use(requireAuth, requireAdmin);

router.get("/products", async (req, res, next) => {
  try {
    const { data, error } = await supabase.from("products").select("*");
    if (error) {
      throw error;
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.post("/products", async (req, res, next) => {
  try {
    const payload = productSchema.parse(req.body);
    const { data, error } = await supabase
      .from("products")
      .insert(payload)
      .select("*")
      .single();
    if (error) {
      throw error;
    }
    res.status(201).json(data);
  } catch (error) {
    next(error);
  }
});

router.patch("/products/:id", async (req, res, next) => {
  try {
    const payload = productSchema.partial().parse(req.body);
    const { data, error } = await supabase
      .from("products")
      .update(payload)
      .eq("id", req.params.id)
      .select("*")
      .single();
    if (error) {
      throw error;
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.delete("/products/:id", async (req, res, next) => {
  try {
    const { error } = await supabase.from("products").delete().eq("id", req.params.id);
    if (error) {
      throw error;
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

router.get("/orders", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(*)")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }
    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
