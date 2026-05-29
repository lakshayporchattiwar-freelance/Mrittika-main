import { Router } from "express";
import { supabase } from "../supabaseClient.js";

const router = Router();

router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("id", req.params.id)
      .single();

    if (error) {
      throw error;
    }

    res.json(data);
  } catch (error) {
    next(error);
  }
});

export default router;
