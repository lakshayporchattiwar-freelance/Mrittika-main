-- Add coupon columns to orders table
ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount INTEGER DEFAULT 0;

-- Create increment_coupon_usage function
CREATE OR REPLACE FUNCTION increment_coupon_usage(coupon_code TEXT)
RETURNS void AS $$
BEGIN
  UPDATE coupons SET used_count = used_count + 1 WHERE code = coupon_code;
END;
$$ LANGUAGE plpgsql;

-- Insert SUM10 coupon
INSERT INTO coupons (code, discount_type, discount_value, min_order_value, max_uses, is_active)
VALUES ('SUM10', 'percentage', 10, 0, 10000, true)
ON CONFLICT (code) DO UPDATE SET
  discount_type = 'percentage',
  discount_value = 10,
  is_active = true;
