-- Add missing columns to products table
ALTER TABLE products ADD COLUMN IF NOT EXISTS compare_price INTEGER;
ALTER TABLE products ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS sku TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS stock_quantity INTEGER DEFAULT 100;
ALTER TABLE products ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Active';
ALTER TABLE products ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;
ALTER TABLE products ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Migrate data from old 'stock' column to 'stock_quantity' if it exists
UPDATE products SET stock_quantity = stock WHERE stock IS NOT NULL AND stock_quantity = 100 AND stock != 100;

-- Add missing columns to coupons table (DB already has min_order_value and used_count)
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses_per_user INTEGER;
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT NOW();

-- Add RLS policy so admin client can read coupons
CREATE POLICY "Service role full access on coupons" ON coupons FOR ALL USING (true) WITH CHECK (true);
