"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

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
    images: product.images || [],
    updated_at: new Date().toISOString(),
  }

  if (product.images && product.images.length > 0) {
    row.image_url = product.images[0]
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
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/product/[slug]")
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
  revalidatePath("/")
  revalidatePath("/shop")
  revalidatePath("/product/[slug]")
  return { success: true }
}
