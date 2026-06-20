export interface OrderItem {
  name: string
  sku?: string
  qty: number
  price: number
  image?: string
}

export interface Order {
  id: string
  customer_name: string
  customer_email: string
  customer_phone?: string
  total: number
  status: string
  payment_method: string
  razorpay_payment_id?: string
  shiprocket_order_id?: string
  shiprocket_awb?: string
  items: OrderItem[]
  shipping_address?: string
  created_at: string
  updated_at?: string
  cancelled_at?: string
  cancellation_reason?: string
  refund_status?: string
  refund_id?: string
  refund_amount?: number
  coupon_code?: string
}

export interface Product {
  id: string
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
  created_at: string
  updated_at?: string
}

export interface Lead {
  id: string
  name: string
  email?: string
  phone?: string
  message?: string
  source: string
  status: string
  notes?: string
  created_at: string
  updated_at?: string
}

export interface Coupon {
  id: string
  code: string
  description?: string
  discount_type: string
  discount_value: number
  min_order_value?: number
  max_uses?: number
  max_uses_per_user?: number
  used_count: number
  is_active: boolean
  expires_at?: string
  created_at: string
}

export interface CouponRedemption {
  id: string
  coupon_id: string
  user_email: string
  order_id: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  excerpt?: string
  content?: string
  featured_image?: string
  category: string
  tags?: string[]
  status: string
  seo_title?: string
  seo_description?: string
  published_at?: string
  created_at: string
  updated_at?: string
}

export interface SeoPage {
  id: string
  page_path: string
  page_name: string
  seo_title?: string
  seo_description?: string
  og_image?: string
  og_title?: string
  og_description?: string
  last_updated?: string
}

export interface StockMovement {
  id: string
  product_id: string
  product_name: string
  previous_quantity: number
  new_quantity: number
  change_amount: number
  note?: string
  updated_by: string
  created_at: string
}

export type DataState = "loading" | "success" | "error"
