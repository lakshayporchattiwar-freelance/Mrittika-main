-- Drop existing tables in dependency order
DROP TABLE IF EXISTS product_images CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS coupons CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Products table
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  stock INTEGER DEFAULT 100,
  weight DECIMAL DEFAULT 0.25,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert the 3 Mrittika products
INSERT INTO products (name, slug, description, price, stock, weight) VALUES
  ('Ubtan Mix Face Pack', 'ubtan-mix-face-pack', 'Brightening ubtan blend with turmeric, sandalwood & gram flour.', 139, 100, 0.25),
  ('Soft Glow Face Pack', 'soft-glow-face-pack', 'Illuminating face pack with natural botanicals for a healthy radiance.', 129, 100, 0.25),
  ('Oil Control Face Pack', 'oil-control-face-pack', 'Balances excess sebum with neem, multani mitti & rose water.', 119, 100, 0.25);

-- Orders table
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Prepaid',
  status TEXT NOT NULL DEFAULT 'Order Confirmed',
  subtotal INTEGER NOT NULL,
  shipping_charge INTEGER DEFAULT 0,
  cod_charge INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  shipping_address TEXT NOT NULL,
  shipping_city TEXT NOT NULL,
  shipping_state TEXT NOT NULL,
  shipping_pincode TEXT NOT NULL,
  shipping_country TEXT DEFAULT 'India',
  shiprocket_order_id TEXT,
  shiprocket_shipment_id TEXT,
  awb_number TEXT,
  courier_name TEXT,
  cancellation JSONB,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items table
CREATE TABLE order_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),
  product_name TEXT NOT NULL,
  product_slug TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  unit_price INTEGER NOT NULL,
  total_price INTEGER NOT NULL,
  image_url TEXT DEFAULT ''
);

-- Reviews table
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_slug TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  is_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Newsletter subscribers table
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Coupons table
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  min_order_value INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ
);

-- Product images table
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);

-- Indexes
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_reviews_product_slug ON reviews(product_slug);

-- Enable Row Level Security
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Service role full access on orders"
  ON orders FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Service role full access on order_items"
  ON order_items FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);
