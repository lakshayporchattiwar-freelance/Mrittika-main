# DATA SCHEMA — Universal D2C E-Commerce Platform

## Complete Database Schema (Supabase/PostgreSQL)

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ═══════════════════════════════════════════════
-- USER PROFILES (linked to Supabase Auth)
-- ═══════════════════════════════════════════════
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- PRODUCTS
-- ═══════════════════════════════════════════════
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  category TEXT NOT NULL,              -- Dynamically set from {PRODUCT_CATEGORIES}
  price NUMERIC(10,2) NOT NULL,
  compare_price NUMERIC(10,2),          -- MRP/strikethrough price
  sku TEXT,
  stock_quantity INTEGER DEFAULT 0,
  status TEXT DEFAULT 'Active',        -- 'Active', 'Draft', 'Out of Stock'
  featured BOOLEAN DEFAULT FALSE,
  images TEXT[],                        -- Array of image URLs (Supabase Storage or external)
  weight NUMERIC(6,2) DEFAULT 0.25,    -- Per-unit weight in kg for shipping
  dimensions JSONB,                     -- { length, breadth, height } in cm for shipping
  hsn_code TEXT DEFAULT '{HSN_CODE}',  -- Harmonized System Nomenclature for shipping
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- ORDERS
-- ═══════════════════════════════════════════════
CREATE TABLE orders (
  id TEXT PRIMARY KEY,                  -- Format: '{ORDER_PREFIX}-{timestamp}' or '{ORDER_PREFIX}-COD-{timestamp}'
  payment_order_id TEXT,                -- Payment gateway order ID
  payment_id TEXT,                      -- Payment gateway payment/transaction ID
  payment_method TEXT NOT NULL,         -- 'Prepaid' or 'COD'
  status TEXT NOT NULL,                 -- 'Order Confirmed', 'Processing', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'
  subtotal NUMERIC(10,2) NOT NULL,
  shipping_charge NUMERIC(10,2) DEFAULT 0,
  cod_charge NUMERIC(10,2) DEFAULT 0,
  discount_amount NUMERIC(10,2) DEFAULT 0,
  total NUMERIC(10,2) NOT NULL,
  coupon_code TEXT,

  -- Customer details
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,

  -- Shipping address
  shipping_address TEXT,
  shipping_city TEXT,
  shipping_state TEXT,
  shipping_pincode TEXT,
  shipping_country TEXT,

  -- Shipping partner integration
  shipping_partner_order_id TEXT,       -- e.g. Shiprocket order ID
  shipping_partner_shipment_id TEXT,    -- e.g. Shiprocket shipment ID
  shipping_sync_status TEXT,            -- 'success', 'failed'
  shipping_error TEXT,
  awb_number TEXT,                      -- Air Waybill number for tracking
  courier_name TEXT,

  -- Cancellation
  cancelled_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  refund_id TEXT,
  refund_status TEXT,                   -- 'processing', 'processed', 'failed'
  refund_amount NUMERIC(10,2),
  shipping_cancel_status TEXT,         -- Status of shipping partner cancellation

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- ORDER ITEMS
-- ═══════════════════════════════════════════════
CREATE TABLE order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  product_slug TEXT,
  quantity INTEGER NOT NULL,
  unit_price NUMERIC(10,2) NOT NULL,
  total_price NUMERIC(10,2) NOT NULL,
  image_url TEXT
);

-- ═══════════════════════════════════════════════
-- COUPONS
-- ═══════════════════════════════════════════════
CREATE TABLE coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL,          -- 'percentage' or 'fixed'
  discount_value NUMERIC(10,2) NOT NULL,
  min_order_value NUMERIC(10,2),
  max_uses INTEGER,
  max_uses_per_user INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- COUPON REDEMPTIONS
-- ═══════════════════════════════════════════════
CREATE TABLE coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_id UUID REFERENCES coupons(id),
  user_email TEXT NOT NULL,
  order_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- REVIEWS
-- ═══════════════════════════════════════════════
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- LEADS (Contact Form / Inquiry Submissions)
-- ═══════════════════════════════════════════════
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form',
  status TEXT DEFAULT 'New',           -- 'New', 'Contacted', 'Qualified', 'Lost'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- BLOG POSTS
-- ═══════════════════════════════════════════════
CREATE TABLE blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT,
  tags TEXT[],
  status TEXT DEFAULT 'Draft',          -- 'Draft', 'Published'
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- SEO PAGES
-- ═══════════════════════════════════════════════
CREATE TABLE seo_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT UNIQUE NOT NULL,
  page_name TEXT NOT NULL,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  last_updated TIMESTAMPTZ
);

-- ═══════════════════════════════════════════════
-- STOCK MOVEMENTS (Audit Trail)
-- ═══════════════════════════════════════════════
CREATE TABLE stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES products(id),
  product_name TEXT,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  change_amount INTEGER,
  note TEXT,
  updated_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- NEWSLETTER SUBSCRIBERS
-- ═══════════════════════════════════════════════
CREATE TABLE newsletter_subscribers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ═══════════════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Public read on products
CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
-- Users manage own profile
CREATE POLICY "Users manage own profile" ON profiles FOR ALL
  USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
-- Users manage own orders
CREATE POLICY "Users manage own orders" ON orders FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
-- Users view own order items
CREATE POLICY "Users view own order items" ON order_items FOR SELECT
  USING (EXISTS (SELECT 1 FROM orders WHERE orders.id = order_items.order_id AND orders.user_id = auth.uid()));

-- ═══════════════════════════════════════════════
-- FUNCTIONS & TRIGGERS
-- ═══════════════════════════════════════════════
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (new.id, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Increment coupon usage RPC
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS VOID AS $$
UPDATE coupons SET used_count = used_count + 1 WHERE code = coupon_code;
$$ LANGUAGE SQL;

-- ═══════════════════════════════════════════════
-- INDEXES
-- ═══════════════════════════════════════════════
CREATE INDEX idx_orders_email ON orders(customer_email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_id ON orders(payment_id);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_reviews_product ON reviews(product_slug);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_coupons_code ON coupons(code);
```

## TypeScript Types

```typescript
interface CartItem {
  id: string; name: string; slug: string;
  price: number; qty: number; image: string;
}

interface CustomerInfo {
  firstName: string; lastName: string; email: string;
  phone: string; address: string; city: string;
  state: string; pincode: string; country: string;
}

interface Order {
  id: string; customer_name: string; customer_email: string;
  customer_phone?: string; total: number; status: string;
  payment_method: string; payment_id?: string;
  shipping_partner_order_id?: string; awb_number?: string;
  items: OrderItem[]; shipping_address?: string;
  created_at: string; updated_at?: string;
  cancelled_at?: string; cancellation_reason?: string;
  refund_status?: string; refund_id?: string;
  refund_amount?: number; coupon_code?: string;
}

interface Product {
  id: string; name: string; slug: string; description?: string;
  category: string; price: number; compare_price?: number;
  sku?: string; stock_quantity: number; status: string;
  featured?: boolean; images?: string[];
  weight?: number; dimensions?: { length: number; breadth: number; height: number };
  created_at: string; updated_at?: string;
}

interface Coupon {
  id: string; code: string; description?: string;
  discount_type: string; discount_value: number;
  min_order_value?: number; max_uses?: number;
  max_uses_per_user?: number; used_count: number;
  is_active: boolean; expires_at?: string; created_at: string;
}

interface Lead {
  id: string; name: string; email?: string; phone?: string;
  message?: string; source: string; status: string;
  notes?: string; created_at: string; updated_at?: string;
}

interface BlogPost {
  id: string; title: string; slug: string; excerpt?: string;
  content?: string; featured_image?: string; category: string;
  tags?: string[]; status: string; seo_title?: string;
  seo_description?: string; published_at?: string;
  created_at: string; updated_at?: string;
}

interface SeoPage {
  id: string; page_path: string; page_name: string;
  seo_title?: string; seo_description?: string;
  og_image?: string; og_title?: string;
  og_description?: string; last_updated?: string;
}

interface StockMovement {
  id: string; product_id: string; product_name: string;
  previous_quantity: number; new_quantity: number;
  change_amount: number; note?: string;
  updated_by: string; created_at: string;
}

type OrderStatus = "Order Confirmed" | "Processing" | "Shipped" | "Out for Delivery" | "Delivered";
type PaymentMethod = "Prepaid" | "COD";
type DataState = "loading" | "success" | "error";
```
