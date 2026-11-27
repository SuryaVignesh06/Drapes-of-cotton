-- ==============================================================================
-- DRAPES OF COTTON — Row Level Security, Admin Guard & Atomic Inventory RPCs
-- ==============================================================================

-- Auto-create customer profile when a new user signs up via Supabase Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    'customer'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Prevent authenticated customers from elevating their own role to 'admin'
create or replace function public.protect_profile_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    if current_setting('role', true) <> 'service_role' then
      raise exception 'Role updates are restricted to privileged server administration.';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_protect_profile_role on public.profiles;
create trigger trg_protect_profile_role
  before update on public.profiles
  for each row execute function public.protect_profile_role();

-- Trusted admin verification helper used by RLS policies
create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

-- Enable RLS across ALL domain tables
alter table public.profiles enable row level security;
alter table public.addresses enable row level security;
alter table public.collections enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;
alter table public.product_variants enable row level security;
alter table public.product_collections enable row level security;
alter table public.wishlists enable row level security;
alter table public.wishlist_items enable row level security;
alter table public.cart_items enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.webhook_events enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.newsletter_subscribers enable row level security;
alter table public.store_settings enable row level security;

-- Profiles policies
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Addresses policies
create policy "Users manage own addresses"
  on public.addresses for all
  using (auth.uid() = user_id or public.is_admin())
  with check (auth.uid() = user_id or public.is_admin());

-- Collections policies
create policy "Public reads published collections"
  on public.collections for select
  using (is_published = true or public.is_admin());

create policy "Admins manage collections"
  on public.collections for all
  using (public.is_admin())
  with check (public.is_admin());

-- Products policies
create policy "Public reads published products"
  on public.products for select
  using (is_published = true or public.is_admin());

create policy "Admins manage products"
  on public.products for all
  using (public.is_admin())
  with check (public.is_admin());

-- Product Images policies
create policy "Public reads published product images"
  on public.product_images for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_published = true or public.is_admin())
    )
  );

create policy "Admins manage product images"
  on public.product_images for all
  using (public.is_admin())
  with check (public.is_admin());

-- Product Variants policies
create policy "Public reads active variants of published products"
  on public.product_variants for select
  using (
    exists (
      select 1 from public.products p
      where p.id = product_id and (p.is_published = true or public.is_admin())
    )
  );

create policy "Admins manage product variants"
  on public.product_variants for all
  using (public.is_admin())
  with check (public.is_admin());

-- Product Collections policies
create policy "Public reads product collection links"
  on public.product_collections for select
  using (true);

create policy "Admins manage product collection links"
  on public.product_collections for all
  using (public.is_admin())
  with check (public.is_admin());

-- Wishlists & Wishlist Items policies
create policy "Users manage own wishlist"
  on public.wishlists for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users manage own wishlist items"
  on public.wishlist_items for all
  using (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_id and w.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.wishlists w
      where w.id = wishlist_id and w.user_id = auth.uid()
    )
  );

-- Cart Items policies
create policy "Users manage own cart items"
  on public.cart_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Orders & Order Items policies
create policy "Users read own orders and admins read all"
  on public.orders for select
  using (auth.uid() = user_id or public.is_admin());

create policy "Admins update orders"
  on public.orders for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "Users read own order items and admins read all"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- Payments policies (service_role writes; users read own payments; admins read all)
create policy "Users read own payments and admins read all"
  on public.payments for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = order_id and (o.user_id = auth.uid() or public.is_admin())
    )
  );

-- Webhook events (service_role & admin audit only)
create policy "Admins read webhook events"
  on public.webhook_events for select
  using (public.is_admin());

-- Inventory movements
create policy "Admins manage inventory movements"
  on public.inventory_movements for all
  using (public.is_admin())
  with check (public.is_admin());

-- Newsletter subscribers (anyone can subscribe via server endpoint; admins read/manage)
create policy "Admins read newsletter subscribers"
  on public.newsletter_subscribers for select
  using (public.is_admin());

-- Store settings (public read for storefront settings, admin write)
create policy "Public reads store settings"
  on public.store_settings for select
  using (true);

create policy "Admins manage store settings"
  on public.store_settings for all
  using (public.is_admin())
  with check (public.is_admin());

-- ==============================================================================
-- ATOMIC ORDER CREATION & STOCK RESERVATION RPC (called via service_role)
-- ==============================================================================
create or replace function public.reserve_inventory_for_order(
  p_order_id uuid,
  p_items jsonb
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product_id uuid;
  v_quantity integer;
  v_current_stock integer;
  v_product_name text;
begin
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_quantity := (v_item ->> 'quantity')::integer;

    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid item quantity for product %', v_product_id;
    end if;

    select stock_quantity, name
      into v_current_stock, v_product_name
      from public.products
      where id = v_product_id and is_published = true
      for update;

    if not found then
      raise exception 'Product % is unavailable.', v_product_id;
    end if;

    if v_current_stock < v_quantity then
      raise exception 'Insufficient stock for % (available: %, requested: %).', v_product_name, v_current_stock, v_quantity;
    end if;

    update public.products
      set stock_quantity = stock_quantity - v_quantity
      where id = v_product_id;

    insert into public.inventory_movements (product_id, quantity_change, reason, reference_id)
    values (v_product_id, -v_quantity, 'order_reservation', p_order_id::text);
  end loop;
end;
$$;

create or replace function public.release_inventory_for_order(
  p_order_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_line record;
begin
  for v_line in
    select product_id, quantity
    from public.order_items
    where order_id = p_order_id and product_id is not null
  loop
    update public.products
      set stock_quantity = stock_quantity + v_line.quantity
      where id = v_line.product_id;

    insert into public.inventory_movements (product_id, quantity_change, reason, reference_id)
    values (v_line.product_id, v_line.quantity, 'order_release', p_order_id::text);
  end loop;
end;
$$;

-- ==============================================================================
-- STORAGE BUCKETS (products, collections, brand-assets)
-- ==============================================================================
insert into storage.buckets (id, name, public)
values
  ('products', 'products', true),
  ('collections', 'collections', true),
  ('brand-assets', 'brand-assets', true)
on conflict (id) do nothing;

create policy "Public read access for storefront buckets"
  on storage.objects for select
  using (bucket_id in ('products', 'collections', 'brand-assets'));

create policy "Admin upload access for storefront buckets"
  on storage.objects for insert
  with check (
    bucket_id in ('products', 'collections', 'brand-assets')
    and public.is_admin()
  );

create policy "Admin update access for storefront buckets"
  on storage.objects for update
  using (
    bucket_id in ('products', 'collections', 'brand-assets')
    and public.is_admin()
  );

create policy "Admin delete access for storefront buckets"
  on storage.objects for delete
  using (
    bucket_id in ('products', 'collections', 'brand-assets')
    and public.is_admin()
  );
