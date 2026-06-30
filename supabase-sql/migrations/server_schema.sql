create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text not null,
  price numeric(10, 2) not null,
  mrp numeric(10, 2) not null,
  badge text,
  category text,
  image_url text,
  created_at timestamptz default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references products(id) on delete cascade,
  image_url text not null,
  sort_order int default 0,
  created_at timestamptz default now()
);

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null,
  payment_method text not null,
  subtotal numeric(10, 2) not null,
  shipping_amount numeric(10, 2) not null,
  total_amount numeric(10, 2) not null,
  shipping_name text not null,
  shipping_phone text not null,
  shipping_address1 text not null,
  shipping_address2 text,
  shipping_city text not null,
  shipping_state text not null,
  shipping_postal_code text not null,
  shipping_country text not null,
  created_at timestamptz default now()
);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  quantity int not null,
  price numeric(10, 2) not null
);

create table if not exists coupons (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  discount_type text not null,
  value numeric(10, 2) not null,
  active boolean default true,
  expires_at timestamptz
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  created_at timestamptz default now()
);

alter table profiles enable row level security;
alter table products enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table coupons enable row level security;
alter table newsletter_subscribers enable row level security;

create policy "Public products read"
  on products for select using (true);

create policy "Public product images read"
  on product_images for select using (true);

create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users manage own orders"
  on orders for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users view own order items"
  on order_items for select
  using (exists (select 1 from orders where orders.id = order_items.order_id and orders.user_id = auth.uid()));

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
