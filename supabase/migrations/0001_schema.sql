-- ============================================================================
-- AuraEssence — Core Schema
-- Postgres / Supabase. Run order: 0001_schema -> 0002_rls -> 0003_seed
-- ============================================================================

create extension if not exists "pgcrypto";
create extension if not exists "citext";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type user_role as enum ('customer', 'admin');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gender_t as enum ('men', 'women', 'unisex');
exception when duplicate_object then null; end $$;

do $$ begin
  create type concentration_t as enum ('Parfum', 'EDP', 'EDT', 'EDC');
exception when duplicate_object then null; end $$;

do $$ begin
  create type zone_t as enum ('dhaka', 'outside');
exception when duplicate_object then null; end $$;

do $$ begin
  create type order_status as enum (
    'pending','paid','processing','dispatched','in_transit',
    'delivered','cancelled','failed','refunded'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type promo_type as enum ('percent','fixed','free_ship');
exception when duplicate_object then null; end $$;

do $$ begin
  create type review_status as enum ('pending','approved','rejected');
exception when duplicate_object then null; end $$;

do $$ begin
  create type gift_card_status as enum ('active','depleted','disabled');
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- Utility functions
-- ---------------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

-- ---------------------------------------------------------------------------
-- Profiles (1:1 with auth.users)
-- ---------------------------------------------------------------------------
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  phone text,
  avatar_url text,
  role user_role not null default 'customer',
  loyalty_points integer not null default 0,
  is_blocked boolean not null default false,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- is_admin() helper for RLS
create or replace function is_admin()
returns boolean language sql security definer stable set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ---------------------------------------------------------------------------
-- Catalog: brands, families, products, variants, images, collections
-- ---------------------------------------------------------------------------
create table if not exists brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  country text,
  logo_url text,
  description text,
  hero_image text,
  created_at timestamptz not null default now()
);

create table if not exists fragrance_families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  accent_color text,
  created_at timestamptz not null default now()
);

create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  sku_base text not null unique,
  slug text not null unique,
  name text not null,
  brand_id uuid not null references brands(id) on delete restrict,
  family_id uuid references fragrance_families(id) on delete set null,
  gender gender_t not null default 'unisex',
  concentration concentration_t not null default 'EDP',
  description text,
  story text,
  top_notes text[] not null default '{}',
  heart_notes text[] not null default '{}',
  base_notes text[] not null default '{}',
  season text[] not null default '{}',
  occasion text[] not null default '{}',
  longevity smallint not null default 3 check (longevity between 1 and 5),
  sillage smallint not null default 3 check (sillage between 1 and 5),
  weight_g integer not null default 350,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  rating_avg numeric(2,1) not null default 0,
  rating_count integer not null default 0,
  search_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  size_ml integer not null,
  sku text not null unique,
  price_bdt integer not null,
  sale_price_bdt integer,
  stock integer not null default 0,
  is_sample boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists product_images (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url text not null,
  alt text,
  position integer not null default 0
);

create table if not exists collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  subtitle text,
  description text,
  cover_image text,
  is_featured boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists collection_products (
  collection_id uuid not null references collections(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  position integer not null default 0,
  primary key (collection_id, product_id)
);

create table if not exists pairs_with (
  product_id uuid not null references products(id) on delete cascade,
  related_product_id uuid not null references products(id) on delete cascade,
  primary key (product_id, related_product_id)
);

-- Indexes for performance (REQ-3: array-contains note filtering)
create index if not exists idx_products_brand on products(brand_id);
create index if not exists idx_products_family on products(family_id);
create index if not exists idx_products_gender on products(gender);
create index if not exists idx_products_active on products(is_active);
create index if not exists idx_products_top_notes on products using gin (top_notes);
create index if not exists idx_products_heart_notes on products using gin (heart_notes);
create index if not exists idx_products_base_notes on products using gin (base_notes);
create index if not exists idx_products_season on products using gin (season);
create index if not exists idx_products_occasion on products using gin (occasion);
create index if not exists idx_variants_product on product_variants(product_id);
create index if not exists idx_images_product on product_images(product_id);

-- ---------------------------------------------------------------------------
-- Users: addresses, wishlists, carts
-- ---------------------------------------------------------------------------
create table if not exists addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  recipient text not null,
  phone text not null,
  line text not null,
  area text not null,
  city text not null default 'Dhaka',
  zone zone_t not null default 'dhaka',
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists idx_addresses_user on addresses(user_id);

create table if not exists wishlists (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table if not exists carts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id uuid primary key default gen_random_uuid(),
  cart_id uuid not null references carts(id) on delete cascade,
  variant_id uuid not null references product_variants(id) on delete cascade,
  qty integer not null default 1 check (qty > 0),
  created_at timestamptz not null default now(),
  unique (cart_id, variant_id)
);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
create sequence if not exists order_no_seq start 1001;

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  order_no text not null unique default ('AE-' || to_char(now(),'YY') || '-' || nextval('order_no_seq')),
  status order_status not null default 'pending',
  subtotal integer not null default 0,
  delivery_fee integer not null default 0,
  discount integer not null default 0,
  gift_wrap_fee integer not null default 0,
  loyalty_redeemed integer not null default 0,
  total integer not null default 0,
  promo_code text,
  is_gift boolean not null default false,
  gift_message text,
  ssl_transaction_id text,
  paperfly_tracking_id text,
  paperfly_attempts integer not null default 0,
  recipient text not null,
  phone text not null,
  email text,
  address_line text not null,
  area text not null,
  city text not null,
  zone zone_t not null default 'dhaka',
  admin_notes text,
  created_at timestamptz not null default now(),
  paid_at timestamptz,
  updated_at timestamptz not null default now()
);
create index if not exists idx_orders_user on orders(user_id);
create index if not exists idx_orders_status on orders(status);
create index if not exists idx_orders_created on orders(created_at);

create table if not exists order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  variant_id uuid references product_variants(id) on delete set null,
  product_name text not null,
  brand_name text,
  size_ml integer not null,
  sku text not null,
  unit_price integer not null,
  qty integer not null,
  image_url text
);
create index if not exists idx_order_items_order on order_items(order_id);

create table if not exists order_events (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders(id) on delete cascade,
  status order_status not null,
  note text,
  created_at timestamptz not null default now()
);
create index if not exists idx_order_events_order on order_events(order_id);

-- ---------------------------------------------------------------------------
-- Reviews & votes
-- ---------------------------------------------------------------------------
create table if not exists reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  title text,
  body text,
  is_verified_purchase boolean not null default false,
  photo_urls text[] not null default '{}',
  status review_status not null default 'pending',
  helpful_count integer not null default 0,
  created_at timestamptz not null default now(),
  unique (product_id, user_id)
);
create index if not exists idx_reviews_product on reviews(product_id);

create table if not exists review_votes (
  review_id uuid not null references reviews(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  helpful boolean not null default true,
  primary key (review_id, user_id)
);

-- rating rollup
create or replace function recalc_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update products p set
    rating_avg = coalesce((
      select round(avg(rating)::numeric, 1) from reviews
      where product_id = pid and status = 'approved'
    ), 0),
    rating_count = (
      select count(*) from reviews
      where product_id = pid and status = 'approved'
    )
  where p.id = pid;
  return null;
end; $$;

drop trigger if exists trg_reviews_rollup on reviews;
create trigger trg_reviews_rollup
  after insert or update or delete on reviews
  for each row execute function recalc_product_rating();

-- helpful_count maintenance
create or replace function recalc_review_helpful()
returns trigger language plpgsql security definer set search_path = public as $$
declare rid uuid;
begin
  rid := coalesce(new.review_id, old.review_id);
  update reviews set helpful_count = (
    select count(*) from review_votes where review_id = rid and helpful
  ) where id = rid;
  return null;
end; $$;

drop trigger if exists trg_review_votes on review_votes;
create trigger trg_review_votes
  after insert or update or delete on review_votes
  for each row execute function recalc_review_helpful();

-- ---------------------------------------------------------------------------
-- Marketing: promo codes, gift cards, newsletter, loyalty, stock alerts
-- ---------------------------------------------------------------------------
create table if not exists promo_codes (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  type promo_type not null default 'percent',
  value integer not null default 0,
  min_order integer not null default 0,
  usage_limit integer,
  used_count integer not null default 0,
  active boolean not null default true,
  expires_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists gift_cards (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  initial_amount integer not null,
  balance integer not null,
  status gift_card_status not null default 'active',
  created_at timestamptz not null default now()
);

create table if not exists newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists loyalty_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  order_id uuid references orders(id) on delete set null,
  points integer not null,
  reason text,
  created_at timestamptz not null default now()
);
create index if not exists idx_loyalty_user on loyalty_transactions(user_id);

create table if not exists stock_notifications (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid not null references product_variants(id) on delete cascade,
  email citext not null,
  notified boolean not null default false,
  created_at timestamptz not null default now(),
  unique (variant_id, email)
);

-- ---------------------------------------------------------------------------
-- Quiz
-- ---------------------------------------------------------------------------
create table if not exists quiz_questions (
  id uuid primary key default gen_random_uuid(),
  position integer not null default 0,
  prompt text not null,
  subtitle text
);

create table if not exists quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references quiz_questions(id) on delete cascade,
  label text not null,
  description text,
  image text,
  family_weights jsonb not null default '{}',
  note_weights jsonb not null default '{}',
  position integer not null default 0
);

-- ---------------------------------------------------------------------------
-- Content / CMS
-- ---------------------------------------------------------------------------
create table if not exists journal_posts (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  excerpt text,
  cover text,
  body text not null,
  author text not null default 'AuraEssence',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists content_pages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  body text not null default '',
  updated_at timestamptz not null default now()
);

create table if not exists banners (
  id uuid primary key default gen_random_uuid(),
  title text,
  subtitle text,
  image text,
  link text,
  cta_label text,
  position integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- Admin / store ops
-- ---------------------------------------------------------------------------
create table if not exists store_settings (
  id boolean primary key default true check (id),
  store_name text not null default 'AuraEssence',
  contact_email text not null default 'concierge@auraessence.com',
  contact_phone text not null default '+880 1700-000000',
  free_ship_threshold integer not null default 8000,
  gift_wrap_fee integer not null default 250,
  loyalty_earn_rate numeric(4,3) not null default 0.020,
  tax_rate numeric(4,3) not null default 0,
  payment_provider text not null default 'mock',
  logistics_provider text not null default 'mock',
  low_stock_threshold integer not null default 5,
  updated_at timestamptz not null default now()
);

create table if not exists shipping_zones (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  zone zone_t not null,
  fee_bdt integer not null,
  free_ship_min integer not null default 8000,
  est_days text not null default '2-4 days'
);

create table if not exists inventory_logs (
  id uuid primary key default gen_random_uuid(),
  variant_id uuid references product_variants(id) on delete set null,
  delta integer not null,
  reason text,
  ref_order uuid references orders(id) on delete set null,
  actor_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id) on delete set null,
  actor_name text,
  action text not null,
  entity text not null,
  entity_id text,
  diff jsonb,
  created_at timestamptz not null default now()
);

create table if not exists admin_notifications (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  title text not null,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['profiles','products','carts','orders','journal_posts','store_settings','content_pages']
  loop
    execute format('drop trigger if exists trg_%1$s_updated on %1$s;', t);
    execute format('create trigger trg_%1$s_updated before update on %1$s for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- RPC: decrement stock atomically + log (used by paid webhook)
-- ---------------------------------------------------------------------------
create or replace function decrement_variant_stock(p_variant uuid, p_qty integer, p_order uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update product_variants
    set stock = greatest(0, stock - p_qty)
    where id = p_variant;
  insert into inventory_logs (variant_id, delta, reason, ref_order)
    values (p_variant, -p_qty, 'order_paid', p_order);
end; $$;
