-- ============================================================
-- MRITTIKA - COMPLETE SUPABASE SCHEMA
-- Run this on a FRESH Supabase project to set up everything
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- 1. PROFILES (extends auth.users)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  full_name TEXT,
  phone TEXT,
  role TEXT DEFAULT 'owner',
  is_admin BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owner can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 2. PRODUCTS
-- ============================================================
CREATE TABLE products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price INTEGER NOT NULL,
  compare_price INTEGER,
  category TEXT,
  sku TEXT,
  stock INTEGER DEFAULT 100,
  stock_quantity INTEGER DEFAULT 100,
  weight DECIMAL DEFAULT 0.25,
  status TEXT DEFAULT 'Active',
  is_active BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  images TEXT[] DEFAULT '{}',
  badge TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public products read" ON products FOR SELECT USING (true);
CREATE POLICY "Anyone can read products" ON products FOR SELECT USING (true);

-- Insert the 3 Mrittika products
INSERT INTO products (name, slug, description, price, stock, weight) VALUES
  ('Ubtan Mix Face Pack', 'ubtan-mix-face-pack', 'Brightening ubtan blend with turmeric, sandalwood & gram flour.', 139, 100, 0.25),
  ('Soft Glow Face Pack', 'soft-glow-face-pack', 'Illuminating face pack with natural botanicals for a healthy radiance.', 129, 100, 0.25),
  ('Oil Control Face Pack', 'oil-control-face-pack', 'Balances excess sebum with neem, multani mitti & rose water.', 119, 100, 0.25);

-- ============================================================
-- 3. PRODUCT IMAGES
-- ============================================================
CREATE TABLE product_images (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  is_primary BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0
);
ALTER TABLE product_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public product images read" ON product_images FOR SELECT USING (true);

-- ============================================================
-- 4. ORDERS
-- ============================================================
CREATE TABLE orders (
  id TEXT PRIMARY KEY,
  razorpay_order_id TEXT,
  razorpay_payment_id TEXT,
  payment_method TEXT NOT NULL DEFAULT 'Prepaid',
  status TEXT NOT NULL DEFAULT 'Order Confirmed',
  subtotal INTEGER NOT NULL,
  shipping_charge INTEGER DEFAULT 0,
  cod_charge INTEGER DEFAULT 0,
  discount_amount INTEGER DEFAULT 0,
  total INTEGER NOT NULL,
  coupon_code TEXT,
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
  shiprocket_sync_status TEXT DEFAULT 'pending',
  shiprocket_error TEXT,
  awb_number TEXT,
  courier_name TEXT,
  cancellation JSONB,
  cancelled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read orders" ON orders FOR SELECT USING (true);
CREATE POLICY "Admin can update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Service role full access on orders" ON orders FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 5. ORDER ITEMS
-- ============================================================
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
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert order items" ON order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can read order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Service role full access on order_items" ON order_items FOR ALL USING (true) WITH CHECK (true);

-- ============================================================
-- 6. REVIEWS
-- ============================================================
CREATE TABLE reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_slug TEXT NOT NULL,
  name TEXT NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  verified BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT USING (true);
CREATE POLICY "Anyone can insert reviews" ON reviews FOR INSERT WITH CHECK (true);

-- Seed reviews for Ubtan Mix Face Pack
INSERT INTO reviews (product_slug, name, rating, comment, verified) VALUES
  ('ubtan-mix-face-pack', 'Sneha R.', 5, 'My skin feels so much brighter after just one week. The turmeric fragrance is divine and it genuinely de-tans!', true),
  ('ubtan-mix-face-pack', 'Arjun M.', 4, 'Great product with natural ingredients. A little goes a long way. Will definitely repurchase.', false);

-- Seed reviews for Soft Glow Face Pack
INSERT INTO reviews (product_slug, name, rating, comment, verified) VALUES
  ('soft-glow-face-pack', 'Divya K.', 5, 'My skin has never felt this soft. The chamomile scent is so calming and the glow lasts all day!', true),
  ('soft-glow-face-pack', 'Isha P.', 4, 'Really nice face pack, feels gentle on sensitive skin. Saw visible improvement in texture within two uses.', false);

-- Seed reviews for Oil Control Face Pack
INSERT INTO reviews (product_slug, name, rating, comment, verified) VALUES
  ('oil-control-face-pack', 'Rohan S.', 5, 'Finally something that controls my oily T-zone without over-drying. The neem feels so refreshing!', true),
  ('oil-control-face-pack', 'Kavita J.', 4, 'Good for everyday use on combination skin. Keeps oil at bay for most of the day. Very happy with the results.', true);

-- ============================================================
-- 7. COUPONS
-- ============================================================
CREATE TABLE coupons (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT DEFAULT 'percentage',
  discount_value INTEGER NOT NULL,
  description TEXT,
  min_order_value INTEGER DEFAULT 0,
  max_uses INTEGER DEFAULT 100,
  max_uses_per_user INTEGER,
  used_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);

-- Insert SUM10 coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, is_active)
VALUES ('SUM10', 'percentage', 10, 0, 10000, true)
ON CONFLICT (code) DO UPDATE SET
  discount_type = 'percentage',
  discount_value = 10,
  is_active = true;

-- ============================================================
-- 8. COUPON REDEMPTIONS
-- ============================================================
CREATE TABLE coupon_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  order_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role manages redemptions" ON coupon_redemptions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Authenticated users read redemptions" ON coupon_redemptions FOR SELECT USING (auth.role() = 'authenticated');

-- ============================================================
-- 9. NEWSLETTER SUBSCRIBERS
-- ============================================================
CREATE TABLE newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  subscribed_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 10. LEADS (Dashboard - inquiries from contact form/WhatsApp)
-- ============================================================
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT,
  source TEXT DEFAULT 'contact_form' CHECK (source IN ('contact_form', 'whatsapp', 'instagram', 'manual')),
  status TEXT DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Converted', 'Closed')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 11. STOCK MOVEMENTS (Dashboard - inventory history)
-- ============================================================
CREATE TABLE stock_movements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID,
  product_name TEXT,
  previous_quantity INTEGER,
  new_quantity INTEGER,
  change_amount INTEGER,
  note TEXT,
  updated_by TEXT DEFAULT 'owner',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage stock" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 12. BLOG POSTS (Dashboard)
-- ============================================================
CREATE TABLE blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  excerpt TEXT,
  content TEXT,
  featured_image TEXT,
  category TEXT DEFAULT 'Skincare',
  tags TEXT[],
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  seo_title TEXT,
  seo_description TEXT,
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage blog" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- ============================================================
-- 13. SEO PAGES (Dashboard)
-- ============================================================
CREATE TABLE seo_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT UNIQUE NOT NULL,
  page_name TEXT,
  seo_title TEXT,
  seo_description TEXT,
  og_image TEXT,
  og_title TEXT,
  og_description TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE seo_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users manage seo" ON seo_pages FOR ALL USING (auth.role() = 'authenticated');

-- Insert default SEO pages
INSERT INTO seo_pages (page_path, page_name) VALUES
  ('/', 'Homepage'),
  ('/shop', 'Shop'),
  ('/about', 'About'),
  ('/contact', 'Contact'),
  ('/track', 'Order Tracking')
ON CONFLICT (page_path) DO NOTHING;

-- ============================================================
-- 14. HELPER FUNCTIONS
-- ============================================================
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- 15. INDEXES
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_order_id ON orders(razorpay_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_razorpay_payment_id ON orders(razorpay_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer_email ON orders(customer_email);
CREATE INDEX IF NOT EXISTS idx_reviews_product_slug ON reviews(product_slug);
CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_coupon_email ON coupon_redemptions(coupon_id, user_email);

-- ============================================================
-- 16. REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;
ALTER PUBLICATION supabase_realtime ADD TABLE coupon_redemptions;
