"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

function resolveImageUrl(url: string): string {
  if (!url) return url
  if (url.startsWith("http://") || url.startsWith("https://")) return url
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  if (url.startsWith("/")) {
    return `${supabaseUrl}/storage/v1/object/public${url}`
  }
  return url
}

export async function upsertProduct(product: {
  id?: string
  name: string
  slug: string
  description?: string
  category: string
  price: number
  compare_price?: number
  sku?: string
  stock_quantity: number
  status: string
  featured?: boolean
  images?: string[]
}) {
  let finalStatus = product.status
  if (product.stock_quantity === 0) {
    finalStatus = "Out of Stock"
  } else if (product.stock_quantity > 0 && product.status === "Out of Stock") {
    finalStatus = "Active"
  }

  const resolvedImages = (product.images || []).map(resolveImageUrl)

  const row: Record<string, unknown> = {
    name: product.name,
    slug: product.slug,
    description: product.description || null,
    category: product.category,
    price: product.price,
    compare_price: product.compare_price || null,
    sku: product.sku || null,
    stock_quantity: product.stock_quantity,
    status: finalStatus,
    featured: product.featured || false,
    images: resolvedImages,
    updated_at: new Date().toISOString(),
  }

  let error
  if (product.id) {
    ;({ error } = await adminSupabase
      .from("products")
      .update(row)
      .eq("id", product.id))
  } else {
    ;({ error } = await adminSupabase.from("products").insert(row))
  }

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/overview")
  return { success: true }
}

export async function deleteProduct(productId: string) {
  const { error } = await adminSupabase
    .from("products")
    .delete()
    .eq("id", productId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/overview")
  return { success: true }
}
