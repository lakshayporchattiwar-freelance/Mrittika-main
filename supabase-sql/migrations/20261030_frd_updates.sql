-- FRD updates: product content fields + UGC table
-- Run in Supabase SQL Editor

-- Product content fields (FR-6)
ALTER TABLE products ADD COLUMN IF NOT EXISTS ingredients TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS how_to_use TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS benefits TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS good_to_know TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new BOOLEAN DEFAULT false;

-- Product UGC (FR-5)
CREATE TABLE IF NOT EXISTS product_ugc (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  product_slug TEXT NOT NULL,
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  name_handle TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  quote TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE product_ugc ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public UGC read" ON product_ugc FOR SELECT USING (true);
CREATE POLICY "Authenticated manage UGC" ON product_ugc FOR ALL USING (auth.role() = 'authenticated') WITH CHECK (auth.role() = 'authenticated');
CREATE INDEX IF NOT EXISTS idx_product_ugc_slug ON product_ugc(product_slug);

-- Ensure existing products are Active
UPDATE products SET status = 'Active' WHERE status IS NULL;
UPDATE products SET is_active = true WHERE is_active IS NULL;
