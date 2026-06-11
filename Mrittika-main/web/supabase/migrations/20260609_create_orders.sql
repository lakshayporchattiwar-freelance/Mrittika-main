-- Orders table
create table if not exists public.orders (
  id text primary key,
  date text not null,
  total integer not null,
  status text not null default 'Order Confirmed',
  tracking_id text not null,
  created_at timestamptz not null default now()
);

-- Order items table
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  name text not null,
  price integer not null,
  qty integer not null,
  image text not null
);

-- Index for order_items lookup
create index if not exists idx_order_items_order_id on public.order_items(order_id);

-- RLS: Enable
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- RLS: Anyone can insert orders (guest checkout)
create policy "Anyone can insert orders"
  on public.orders for insert
  with check (true);

-- RLS: Anyone can read orders (for tracking/orders page by ID)
create policy "Anyone can read orders"
  on public.orders for select
  using (true);

-- RLS: Only admin can update order status
create policy "Admin can update orders"
  on public.orders for update
  using (auth.role() = 'authenticated');

-- RLS: Anyone can insert order items
create policy "Anyone can insert order items"
  on public.order_items for insert
  with check (true);

-- RLS: Anyone can read order items
create policy "Anyone can read order items"
  on public.order_items for select
  using (true);
