import { supabase } from "@/lib/supabaseClient";

export type Review = {
  id: string;
  product_slug: string;
  name: string;
  rating: number;
  comment: string;
  verified: boolean;
  created_at: string;
};

export async function getReviews(productSlug: string): Promise<Review[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from("reviews")
    .select("*")
    .eq("product_slug", productSlug)
    .order("created_at", { ascending: false });
  if (error || !data) return [];
  return data as Review[];
}

export async function submitReview(
  productSlug: string,
  name: string,
  rating: number,
  comment: string
): Promise<Review | null> {
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reviews")
    .insert({ product_slug: productSlug, name, rating, comment })
    .select()
    .single();
  if (error || !data) return null;
  return data as Review;
}
