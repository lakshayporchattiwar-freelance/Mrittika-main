"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function getReviews() {
  const { data, error } = await adminSupabase
    .from("reviews")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[REVIEWS] Fetch error:", error)
    return []
  }
  return data || []
}

export async function verifyReview(reviewId: string) {
  const { error } = await adminSupabase
    .from("reviews")
    .update({ verified: true })
    .eq("id", reviewId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/reviews")
  return { success: true }
}

export async function unverifyReview(reviewId: string) {
  const { error } = await adminSupabase
    .from("reviews")
    .update({ verified: false })
    .eq("id", reviewId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/reviews")
  return { success: true }
}

export async function deleteReview(reviewId: string) {
  const { error } = await adminSupabase
    .from("reviews")
    .delete()
    .eq("id", reviewId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/reviews")
  return { success: true }
}

export async function addReview(review: {
  productSlug: string
  name: string
  rating: number
  comment: string
  verified: boolean
}) {
  const { error } = await adminSupabase
    .from("reviews")
    .insert({
      product_slug: review.productSlug,
      name: review.name,
      rating: review.rating,
      comment: review.comment,
      verified: review.verified,
    })

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/reviews")
  return { success: true }
}
