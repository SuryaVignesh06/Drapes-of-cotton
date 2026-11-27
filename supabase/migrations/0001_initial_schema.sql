-- ==============================================================================
-- DRAPES OF COTTON — Initial Relational Schema (PostgreSQL / Supabase)
-- Monetary fields are stored as integer minor units (INR paise, e.g. 149900 = ₹1,499).
-- ==============================================================================

create extension if not exists "pgcrypto";

-- Shared updated_at trigger function
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

-- 1. Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  role text not null default 'customer' check (role in ('customer', 'admin')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create trigger trg_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- 2. Customer Addresses
create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line_1 text not null,
  address_line_2 text,
  area text not null,
  city text not null,
  state text not null,
  postal_code text not null check (postal_code ~ '^[1-9][0-9]{5}$'),
  country text not null default 'India',
  address_type text not null default 'home' check (address_type in ('home', 'work', 'other')),
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_addresses_user_id on public.addresses(user_id);
create unique index if not exists idx_addresses_single_default
  on public.addresses(user_id)
  where is_default = true;

-- 3. Collections
create table if not exists public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  cover_image text,
  is_featured boolean not null default false,
  is_published boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_collections_published_sort
  on public.collections(is_published, sort_order);

create trigger trg_collections_updated_at
  before update on public.collections
  for each row execute function public.set_updated_at();

-- 4. Products
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  sku text not null unique,
  short_description text not null,
  description text not null,
  price integer not null check (price >= 0),
  compare_at_price integer check (compare_at_price is null or compare_at_price >= 0),
  currency text not null default 'INR',
  fabric text not null,
  weave text,
  color text not null,
  occasion text not null,
  saree_length text,
  blouse_piece_length text,
  blouse_piece_included boolean not null default true,
  care_instructions text,
  origin text,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  is_featured boolean not null default false,
  is_new boolean not null default false,
  is_published boolean not null default false,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_products_published_created on public.products(is_published, created_at desc);
create index if not exists idx_products_featured on public.products(is_featured) where is_published = true;
create index if not exists idx_products_color_fabric_occasion on public.products(color, fabric, occasion);
create index if not exists idx_products_price on public.products(price);

create trigger trg_products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- 5. Product Images
create table if not exists public.product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  image_url text not null,
  alt_text text not null,
  image_type text not null default 'main' check (image_type in ('main', 'full', 'detail', 'border', 'pallu', 'drape')),
  sort_order integer not null default 0,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_product_images_product_sort
  on public.product_images(product_id, sort_order);

-- 6. Product Variants (optional per product)
create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  name text not null,
  sku text not null unique,
  price integer not null check (price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  attributes jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_product_variants_product on public.product_variants(product_id);

-- 7. Product <-> Collection Many-to-Many
create table if not exists public.product_collections (
  product_id uuid not null references public.products(id) on delete cascade,
  collection_id uuid not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

create index if not exists idx_product_collections_collection
  on public.product_collections(collection_id);

-- 8. Wishlists
create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now())
);

-- 9. Wishlist Items
create table if not exists public.wishlist_items (
  id uuid primary key default gen_random_uuid(),
  wishlist_id uuid not null references public.wishlists(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (wishlist_id, product_id)
);

create index if not exists idx_wishlist_items_wishlist on public.wishlist_items(wishlist_id);

-- 10. Cart Items (authenticated server-synced bag)
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  variant_id uuid references public.product_variants(id) on delete set null,
  quantity integer not null check (quantity > 0 and quantity <= 20),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create unique index if not exists idx_cart_items_unique_line
  on public.cart_items(user_id, product_id, coalesce(variant_id, '00000000-0000-0000-0000-000000000000'::uuid));

create trigger trg_cart_items_updated_at
  before update on public.cart_items
  for each row execute function public.set_updated_at();

-- 11. Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_email text not null,
  customer_name text not null,
  customer_phone text not null,
  subtotal integer not null check (subtotal >= 0),
  discount_amount integer not null default 0 check (discount_amount >= 0),
  shipping_amount integer not null default 0 check (shipping_amount >= 0),
  total_amount integer not null check (total_amount >= 0),
  currency text not null default 'INR',
  payment_status text not null default 'pending' check (
    payment_status in ('pending', 'authorized', 'paid', 'failed', 'refunded')
  ),
  fulfilment_status text not null default 'pending' check (
    fulfilment_status in (
      'pending',
      'payment_pending',
      'confirmed',
      'processing',
      'shipped',
      'delivered',
      'cancelled',
      'refunded'
    )
  ),
  shipping_address jsonb not null,
  shipping_method text not null default 'standard',
  coupon_code text,
  status_history jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_orders_user_created on public.orders(user_id, created_at desc);
create index if not exists idx_orders_status on public.orders(payment_status, fulfilment_status);

create trigger trg_orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- 12. Order Items (immutable snapshot)
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name_snapshot text not null,
  sku_snapshot text not null,
  unit_price integer not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total integer not null check (line_total >= 0),
  variant_snapshot jsonb,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_order_items_order on public.order_items(order_id);

-- 13. Payments
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  provider text not null default 'razorpay',
  provider_order_id text not null unique,
  provider_payment_id text unique,
  provider_signature text,
  amount integer not null check (amount >= 0),
  currency text not null default 'INR',
  status text not null default 'created' check (
    status in ('created', 'authorized', 'captured', 'failed', 'refunded')
  ),
  raw_payload jsonb,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_payments_order on public.payments(order_id);

-- 14. Webhook Idempotency Log
create table if not exists public.webhook_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_id text not null unique,
  event_type text not null,
  payload jsonb not null,
  processed_at timestamptz not null default timezone('utc', now())
);

-- 15. Inventory Movements
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  quantity_change integer not null,
  reason text not null,
  reference_id text,
  created_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_inventory_movements_product
  on public.inventory_movements(product_id, created_at desc);

-- 16. Newsletter Subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  status text not null default 'active' check (status in ('active', 'unsubscribed')),
  created_at timestamptz not null default timezone('utc', now())
);

-- 17. Configurable Store Settings (shipping rates, coupons, editorial copy)
create table if not exists public.store_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default timezone('utc', now())
);
