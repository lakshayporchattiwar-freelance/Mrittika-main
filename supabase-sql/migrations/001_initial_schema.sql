-- Dashboard owner profile (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email text,
  full_name text DEFAULT 'Charvi',
  role text DEFAULT 'owner',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner can read own profile" ON profiles FOR SELECT USING (auth.uid() = id);

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name) VALUES (NEW.id, NEW.email, split_part(NEW.email,'@',1));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Leads table (inquiries from contact form and WhatsApp)
CREATE TABLE IF NOT EXISTS leads (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  email text,
  phone text,
  message text,
  source text DEFAULT 'contact_form' CHECK (source IN ('contact_form','whatsapp','instagram','manual')),
  status text DEFAULT 'New' CHECK (status IN ('New','Contacted','Converted','Closed')),
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage leads" ON leads FOR ALL USING (auth.role() = 'authenticated');

-- Stock movements table (inventory history)
CREATE TABLE IF NOT EXISTS stock_movements (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid,
  product_name text,
  previous_quantity integer,
  new_quantity integer,
  change_amount integer,
  note text,
  updated_by text DEFAULT 'owner',
  created_at timestamptz DEFAULT now()
);
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage stock" ON stock_movements FOR ALL USING (auth.role() = 'authenticated');

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  excerpt text,
  content text,
  featured_image text,
  category text DEFAULT 'Skincare',
  tags text[],
  status text DEFAULT 'draft' CHECK (status IN ('draft','published')),
  seo_title text,
  seo_description text,
  published_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users manage blog" ON blog_posts FOR ALL USING (auth.role() = 'authenticated');

-- SEO pages table
CREATE TABLE IF NOT EXISTS seo_pages (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path text UNIQUE NOT NULL,
  page_name text,
  seo_title text,
  seo_description text,
  og_image text,
  og_title text,
  og_description text,
  last_updated timestamptz DEFAULT now()
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

-- Enable realtime for orders and leads (so dashboard gets live updates)
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
ALTER PUBLICATION supabase_realtime ADD TABLE leads;

-- Index for faster dashboard queries
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_idx ON orders (status);
CREATE INDEX IF NOT EXISTS orders_customer_email_idx ON orders (customer_email);
