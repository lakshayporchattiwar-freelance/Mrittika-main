"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function listUgc(productSlug: string) {
  const { data, error } = await adminSupabase
    .from("product_ugc")
    .select("*")
    .eq("product_slug", productSlug)
    .order("sort_order", { ascending: true })
  if (error) return { success: false, error: error.message, items: [] }
  return { success: true, items: data || [] }
}

export async function addUgc(item: {
  product_slug: string
  video_url: string
  thumbnail_url?: string
  name_handle?: string
  rating?: number
  quote?: string
}) {
  const { error } = await adminSupabase.from("product_ugc").insert({
    product_slug: item.product_slug,
    video_url: item.video_url,
    thumbnail_url: item.thumbnail_url || null,
    name_handle: item.name_handle || null,
    rating: item.rating || null,
    quote: item.quote || null,
    sort_order: 0,
  })
  if (error) return { success: false, error: error.message }
  revalidatePath(`/product/${item.product_slug}`)
  return { success: true }
}

export async function deleteUgc(id: string, productSlug: string) {
  const { error } = await adminSupabase.from("product_ugc").delete().eq("id", id)
  if (error) return { success: false, error: error.message }
  revalidatePath(`/product/${productSlug}`)
  return { success: true }
}
