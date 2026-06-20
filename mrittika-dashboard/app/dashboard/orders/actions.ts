"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function updateOrderStatus(
  orderId: string,
  newStatus: string,
  awb?: string
) {
  const update: Record<string, unknown> = { status: newStatus }
  if (awb) {
    update.shiprocket_awb = awb
  }
  const { error } = await adminSupabase
    .from("orders")
    .update(update)
    .eq("id", orderId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/orders")
  revalidatePath("/dashboard/overview")
  return { success: true }
}

export async function initiateRefund(
  orderId: string,
  amount: number,
  paymentId: string
) {
  const keyId = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET

  if (!keyId || !keySecret) {
    return { success: false, error: "Razorpay credentials not configured" }
  }

  try {
    const res = await fetch(
      `https://api.razorpay.com/v1/payments/${paymentId}/refund`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString("base64")}`,
        },
        body: JSON.stringify({ amount: Math.round(amount * 100) }),
      }
    )

    if (!res.ok) {
      const data = await res.json()
      return { success: false, error: data.error?.description || "Refund failed" }
    }

    await adminSupabase
      .from("orders")
      .update({ refund_status: "processing" })
      .eq("id", orderId)

    revalidatePath("/dashboard/orders")
    revalidatePath("/dashboard/overview")
    return { success: true }
  } catch (err) {
    return { success: false, error: "Refund request failed" }
  }
}
