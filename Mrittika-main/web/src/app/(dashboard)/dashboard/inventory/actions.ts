"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function fetchInventoryProducts() {
  const { data, error } = await adminSupabase
    .from("products")
    .select("*")
    .order("stock_quantity", { ascending: true })

  if (error) return []
  return data || []
}

export async function updateStock(
  productId: string,
  productName: string,
  previousQty: number,
  newQty: number,
  note?: string
) {
  let finalStatus: string | undefined
  if (newQty === 0) {
    finalStatus = "Out of Stock"
  } else if (newQty > 0 && previousQty === 0) {
    finalStatus = "Active"
  }

  const update: Record<string, unknown> = {
    stock_quantity: newQty,
    updated_at: new Date().toISOString(),
  }
  if (finalStatus) update.status = finalStatus

  const { error: updateError } = await adminSupabase
    .from("products")
    .update(update)
    .eq("id", productId)

  if (updateError) return { success: false, error: updateError.message }

  const { error: insertError } = await adminSupabase
    .from("stock_movements")
    .insert({
      product_id: productId,
      product_name: productName,
      previous_quantity: previousQty,
      new_quantity: newQty,
      change_amount: newQty - previousQty,
      note: note || null,
      updated_by: "owner",
    })

  if (insertError) return { success: false, error: insertError.message }

  revalidatePath("/dashboard/inventory")
  revalidatePath("/dashboard/products")
  revalidatePath("/dashboard/overview")
  return { success: true }
}

export async function getStockHistory(productId: string) {
  const { data, error } = await adminSupabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}
