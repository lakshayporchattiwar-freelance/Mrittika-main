"use server"

import { adminSupabase } from "@/utils/supabase/admin"
import { revalidatePath } from "next/cache"

export async function upsertCoupon(coupon: {
  id?: string
  code: string
  description?: string
  discount_type: string
  discount_value: number
  min_order_value?: number
  max_uses?: number
  max_uses_per_user?: number
  is_active?: boolean
  expires_at?: string
}) {
  const row: Record<string, unknown> = {
    code: coupon.code.toUpperCase(),
    description: coupon.description || null,
    discount_type: coupon.discount_type,
    discount_value: coupon.discount_value,
    min_order_value: coupon.min_order_value || null,
    max_uses: coupon.max_uses || null,
    max_uses_per_user: coupon.max_uses_per_user || null,
    is_active: coupon.is_active ?? true,
    expires_at: coupon.expires_at || null,
  }

  let error
  if (coupon.id) {
    ;({ error } = await adminSupabase
      .from("coupons")
      .update(row)
      .eq("id", coupon.id))
  } else {
    const { data: existing } = await adminSupabase
      .from("coupons")
      .select("id")
      .eq("code", coupon.code.toUpperCase())
      .maybeSingle()

    if (existing) {
      return { success: false, error: "A coupon with this code already exists" }
    }

    ;({ error } = await adminSupabase.from("coupons").insert(row))
  }

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/coupons")
  return { success: true }
}

export async function getCoupons() {
  const [couponRes, orderRes] = await Promise.all([
    adminSupabase
      .from("coupons")
      .select("*"),
    adminSupabase
      .from("orders")
      .select("coupon_code, total")
      .not("coupon_code", "is", null),
  ])

  if (couponRes.error) {
    console.error("getCoupons error:", couponRes.error.message)
  }
  if (orderRes.error) {
    console.error("getOrderPerformance error:", orderRes.error.message)
  }

  const coupons = couponRes.data || []
  const orders = orderRes.data || []

  const performance: Record<string, { uses: number; revenue: number }> = {}
  for (const o of orders) {
    const code = (o.coupon_code || "").toUpperCase()
    if (!performance[code]) performance[code] = { uses: 0, revenue: 0 }
    performance[code].uses++
    performance[code].revenue += o.total || 0
  }

  return { coupons, performance }
}

export async function deleteCoupon(couponId: string) {
  const { error } = await adminSupabase
    .from("coupons")
    .delete()
    .eq("id", couponId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/coupons")
  return { success: true }
}

export async function toggleCouponActive(couponId: string, isActive: boolean) {
  const { error } = await adminSupabase
    .from("coupons")
    .update({ is_active: isActive })
    .eq("id", couponId)

  if (error) return { success: false, error: error.message }
  revalidatePath("/dashboard/coupons")
  return { success: true }
}

export async function validateCouponForUser(
  code: string,
  userEmail: string,
  orderAmount: number
) {
  const { data: coupon, error } = await adminSupabase
    .from("coupons")
    .select("*")
    .eq("code", code.toUpperCase())
    .eq("is_active", true)
    .single()

  if (error || !coupon) {
    return { valid: false, error: "Invalid or inactive coupon code" }
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return { valid: false, error: "This coupon has expired" }
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { valid: false, error: "This coupon has reached its usage limit" }
  }

  if (coupon.min_order_value && orderAmount < coupon.min_order_value) {
    return { valid: false, error: `Minimum order amount is ₹${coupon.min_order_value}` }
  }

  if (coupon.max_uses_per_user && userEmail) {
    const { count } = await adminSupabase
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", coupon.id)
      .eq("user_email", userEmail)

    if (count && count >= coupon.max_uses_per_user) {
      return { valid: false, error: "You have already used this coupon the maximum number of times" }
    }
  }

  const discount = coupon.discount_type === "percentage"
    ? Math.round(orderAmount * coupon.discount_value / 100)
    : coupon.discount_value

  return {
    valid: true,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      discount_amount: Math.min(discount, orderAmount),
    },
  }
}

export async function redeemCoupon(
  couponId: string,
  userEmail: string,
  orderId: string
) {
  const { data: coupon } = await adminSupabase
    .from("coupons")
    .select("id, code, max_uses, max_uses_per_user, used_count")
    .eq("id", couponId)
    .single()

  if (!coupon) {
    return { success: false, error: "Coupon not found" }
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return { success: false, error: "Coupon usage limit reached" }
  }

  if (coupon.max_uses_per_user && userEmail) {
    const { count } = await adminSupabase
      .from("coupon_redemptions")
      .select("id", { count: "exact", head: true })
      .eq("coupon_id", couponId)
      .eq("user_email", userEmail)

    if (count && count >= coupon.max_uses_per_user) {
      return { success: false, error: "User has reached the usage limit for this coupon" }
    }
  }

  const { error: redemptionError } = await adminSupabase
    .from("coupon_redemptions")
    .insert({
      coupon_id: couponId,
      user_email: userEmail,
      order_id: orderId,
    })

  if (redemptionError) {
    return { success: false, error: "Failed to record coupon usage" }
  }

  const { error: updateError } = await adminSupabase
    .from("coupons")
    .update({ used_count: coupon.used_count + 1 })
    .eq("id", couponId)

  if (updateError) {
    return { success: false, error: "Failed to update coupon usage count" }
  }

  revalidatePath("/dashboard/coupons")
  return { success: true }
}

export async function getCouponRedemptions(couponId: string) {
  const { data, error } = await adminSupabase
    .from("coupon_redemptions")
    .select("*")
    .eq("coupon_id", couponId)
    .order("created_at", { ascending: false })

  if (error) return []
  return data || []
}
