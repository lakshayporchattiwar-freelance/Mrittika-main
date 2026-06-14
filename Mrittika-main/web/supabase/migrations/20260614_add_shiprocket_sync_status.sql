ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_sync_status TEXT DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shiprocket_error TEXT;
