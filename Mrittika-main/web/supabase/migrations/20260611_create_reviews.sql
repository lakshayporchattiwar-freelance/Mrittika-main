create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_slug text not null,
  name text not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null,
  verified boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists idx_reviews_product_slug on public.reviews(product_slug);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select
  using (true);

create policy "Anyone can insert reviews"
  on public.reviews for insert
  with check (true);

-- Seed reviews for Ubtan Mix Face Pack
insert into public.reviews (product_slug, name, rating, comment, verified) values
  ('ubtan-mix-face-pack', 'Sneha R.', 5, 'My skin feels so much brighter after just one week. The turmeric fragrance is divine and it genuinely de-tans!', true),
  ('ubtan-mix-face-pack', 'Arjun M.', 4, 'Great product with natural ingredients. A little goes a long way. Will definitely repurchase.', false);

-- Seed reviews for Soft Glow Face Pack
insert into public.reviews (product_slug, name, rating, comment, verified) values
  ('soft-glow-face-pack', 'Divya K.', 5, 'My skin has never felt this soft. The chamomile scent is so calming and the glow lasts all day!', true),
  ('soft-glow-face-pack', 'Isha P.', 4, 'Really nice face pack, feels gentle on sensitive skin. Saw visible improvement in texture within two uses.', false);

-- Seed reviews for Oil Control Face Pack
insert into public.reviews (product_slug, name, rating, comment, verified) values
  ('oil-control-face-pack', 'Rohan S.', 5, 'Finally something that controls my oily T-zone without over-drying. The neem feels so refreshing!', true),
  ('oil-control-face-pack', 'Kavita J.', 4, 'Good for everyday use on combination skin. Keeps oil at bay for most of the day. Very happy with the results.', true);
