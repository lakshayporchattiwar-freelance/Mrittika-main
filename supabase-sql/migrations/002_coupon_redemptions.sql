-- Add max_uses_per_user column to coupons
ALTER TABLE coupons ADD COLUMN IF NOT EXISTS max_uses_per_user integer;

-- Create coupon_redemptions table for per-user tracking
CREATE TABLE IF NOT EXISTS coupon_redemptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  coupon_id uuid REFERENCES coupons(id) ON DELETE CASCADE,
  user_email text NOT NULL,
  order_id text,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE coupon_redemptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Service role manages redemptions" ON coupon_redemptions FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Authenticated users read redemptions" ON coupon_redemptions FOR SELECT USING (auth.role() = 'authenticated');

-- Index for faster per-user lookup
CREATE INDEX IF NOT EXISTS coupon_redemptions_coupon_email_idx ON coupon_redemptions (coupon_id, user_email);

-- Enable realtime for coupon_redemptions
ALTER PUBLICATION supabase_realtime ADD TABLE coupon_redemptions;
