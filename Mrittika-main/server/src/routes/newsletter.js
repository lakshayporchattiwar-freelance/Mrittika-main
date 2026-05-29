import { Router } from "express";
import { z } from "zod";
import { supabase } from "../supabaseClient.js";

const router = Router();

const newsletterSchema = z.object({
  email: z.string().email(),
});

router.post("/", async (req, res, next) => {
  try {
    const payload = newsletterSchema.parse(req.body);
    const { error } = await supabase.from("newsletter_subscribers").insert({
      email: payload.email,
    });

    if (error) {
      throw error;
    }

    res.status(201).json({ status: "subscribed" });
  } catch (error) {
    next(error);
  }
});

export default router;
