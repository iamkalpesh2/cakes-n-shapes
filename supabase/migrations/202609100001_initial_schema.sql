create extension if not exists "pgcrypto";

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null check (category in ('cakes', 'cupcakes', 'jar-cakes', 'brownies', 'popsicles', 'hampers')),
  tag text not null default '',
  description text not null,
  details text not null,
  image_url text not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_sizes (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  label text not null,
  price_minor integer not null check (price_minor >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (product_id, label)
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  required_date date not null,
  delivery_address text not null,
  notes text,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled')),
  total_minor integer not null check (total_minor >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  size_label text not null,
  unit_price_minor integer not null check (unit_price_minor >= 0),
  quantity integer not null check (quantity between 1 and 50)
);

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  message text not null check (char_length(message) between 10 and 1000),
  rating integer not null check (rating between 1 and 5),
  is_published boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.settings (
  key text primary key,
  value jsonb not null,
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null default 'admin' check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create index if not exists products_category_active_idx on public.products(category, is_active);
create index if not exists product_sizes_product_active_idx on public.product_sizes(product_id, is_active);
create index if not exists orders_status_created_idx on public.orders(status, created_at desc);
create index if not exists feedback_published_created_idx on public.feedback(is_published, created_at desc);

alter table public.products enable row level security;
alter table public.product_sizes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.feedback enable row level security;
alter table public.settings enable row level security;
alter table public.admin_users enable row level security;

create policy "public can view active products" on public.products for select using (is_active = true);
create policy "public can view active sizes" on public.product_sizes for select using (is_active = true);
create policy "public can view published feedback" on public.feedback for select using (is_published = true);
create policy "public can submit feedback" on public.feedback for insert with check (is_published = false);
create policy "public can view public settings" on public.settings for select using (is_public = true);
create policy "admins can manage products" on public.products for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can manage sizes" on public.product_sizes for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can manage orders" on public.orders for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can manage order items" on public.order_items for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can manage feedback" on public.feedback for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));
create policy "admins can manage settings" on public.settings for all using (exists (select 1 from public.admin_users where user_id = auth.uid()));

insert into public.settings (key, value, is_public) values
  ('business', '{"name":"Cakes n'' Shapes","location":"Dahisar, Mumbai","phone":"+91 98696 00561","whatsapp":"919869600561"}', true),
  ('site_copy', '{"title":"Little treats for big moments.","founded":"2021","baker":"Rinku Shah"}', true)
on conflict (key) do nothing;
