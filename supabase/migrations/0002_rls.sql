-- ============================================================================
-- AuraEssence — Row Level Security
-- Catalog/content: public read. User-owned: scoped to auth.uid(). Admin: full.
-- ============================================================================

-- Enable RLS everywhere
alter table profiles enable row level security;
alter table brands enable row level security;
alter table fragrance_families enable row level security;
alter table products enable row level security;
alter table product_variants enable row level security;
alter table product_images enable row level security;
alter table collections enable row level security;
alter table collection_products enable row level security;
alter table pairs_with enable row level security;
alter table addresses enable row level security;
alter table wishlists enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table order_events enable row level security;
alter table reviews enable row level security;
alter table review_votes enable row level security;
alter table promo_codes enable row level security;
alter table gift_cards enable row level security;
alter table newsletter_subscribers enable row level security;
alter table loyalty_transactions enable row level security;
alter table stock_notifications enable row level security;
alter table quiz_questions enable row level security;
alter table quiz_options enable row level security;
alter table journal_posts enable row level security;
alter table content_pages enable row level security;
alter table banners enable row level security;
alter table store_settings enable row level security;
alter table shipping_zones enable row level security;
alter table inventory_logs enable row level security;
alter table audit_log enable row level security;
alter table admin_notifications enable row level security;

-- Helper macro: public read + admin write -------------------------------------
-- Catalog & content readable by anyone
do $$
declare t text;
begin
  foreach t in array array[
    'brands','fragrance_families','products','product_variants','product_images',
    'collections','collection_products','pairs_with','quiz_questions','quiz_options',
    'shipping_zones','banners','content_pages'
  ] loop
    execute format('drop policy if exists "%1$s_read" on %1$s;', t);
    execute format('create policy "%1$s_read" on %1$s for select using (true);', t);
    execute format('drop policy if exists "%1$s_admin" on %1$s;', t);
    execute format('create policy "%1$s_admin" on %1$s for all using (is_admin()) with check (is_admin());', t);
  end loop;
end $$;

-- Journal: public can read published; admin all
drop policy if exists "journal_read" on journal_posts;
create policy "journal_read" on journal_posts for select
  using (published_at is not null or is_admin());
drop policy if exists "journal_admin" on journal_posts;
create policy "journal_admin" on journal_posts for all
  using (is_admin()) with check (is_admin());

-- store_settings: readable by all (for fees/thresholds), writable by admin
drop policy if exists "settings_read" on store_settings;
create policy "settings_read" on store_settings for select using (true);
drop policy if exists "settings_admin" on store_settings;
create policy "settings_admin" on store_settings for all using (is_admin()) with check (is_admin());

-- profiles: self read/update; admin full
drop policy if exists "profiles_self_read" on profiles;
create policy "profiles_self_read" on profiles for select
  using (auth.uid() = id or is_admin());
drop policy if exists "profiles_self_update" on profiles;
create policy "profiles_self_update" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);
drop policy if exists "profiles_admin" on profiles;
create policy "profiles_admin" on profiles for all using (is_admin()) with check (is_admin());

-- addresses: owner only
drop policy if exists "addresses_owner" on addresses;
create policy "addresses_owner" on addresses for all
  using (auth.uid() = user_id or is_admin())
  with check (auth.uid() = user_id);

-- wishlists: owner only
drop policy if exists "wishlists_owner" on wishlists;
create policy "wishlists_owner" on wishlists for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- carts: owner only
drop policy if exists "carts_owner" on carts;
create policy "carts_owner" on carts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "cart_items_owner" on cart_items;
create policy "cart_items_owner" on cart_items for all
  using (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()))
  with check (exists (select 1 from carts c where c.id = cart_id and c.user_id = auth.uid()));

-- orders: owner read; admin full. Writes go through service role (webhooks/actions).
drop policy if exists "orders_owner_read" on orders;
create policy "orders_owner_read" on orders for select
  using (auth.uid() = user_id or is_admin());
drop policy if exists "orders_admin" on orders;
create policy "orders_admin" on orders for all using (is_admin()) with check (is_admin());

drop policy if exists "order_items_read" on order_items;
create policy "order_items_read" on order_items for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
drop policy if exists "order_items_admin" on order_items;
create policy "order_items_admin" on order_items for all using (is_admin()) with check (is_admin());

drop policy if exists "order_events_read" on order_events;
create policy "order_events_read" on order_events for select
  using (exists (select 1 from orders o where o.id = order_id and (o.user_id = auth.uid() or is_admin())));
drop policy if exists "order_events_admin" on order_events;
create policy "order_events_admin" on order_events for all using (is_admin()) with check (is_admin());

-- reviews: approved public-read; owner read own; owner insert/update/delete; admin full
drop policy if exists "reviews_read" on reviews;
create policy "reviews_read" on reviews for select
  using (status = 'approved' or auth.uid() = user_id or is_admin());
drop policy if exists "reviews_insert" on reviews;
create policy "reviews_insert" on reviews for insert
  with check (auth.uid() = user_id);
drop policy if exists "reviews_update_own" on reviews;
create policy "reviews_update_own" on reviews for update
  using (auth.uid() = user_id) with check (auth.uid() = user_id);
drop policy if exists "reviews_admin" on reviews;
create policy "reviews_admin" on reviews for all using (is_admin()) with check (is_admin());

drop policy if exists "review_votes_owner" on review_votes;
create policy "review_votes_owner" on review_votes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- loyalty: owner read; admin full
drop policy if exists "loyalty_owner_read" on loyalty_transactions;
create policy "loyalty_owner_read" on loyalty_transactions for select
  using (auth.uid() = user_id or is_admin());
drop policy if exists "loyalty_admin" on loyalty_transactions;
create policy "loyalty_admin" on loyalty_transactions for all using (is_admin()) with check (is_admin());

-- newsletter: anyone can subscribe; admin reads
drop policy if exists "newsletter_insert" on newsletter_subscribers;
create policy "newsletter_insert" on newsletter_subscribers for insert with check (true);
drop policy if exists "newsletter_admin" on newsletter_subscribers;
create policy "newsletter_admin" on newsletter_subscribers for all using (is_admin()) with check (is_admin());

-- stock notifications: anyone can request; admin manages
drop policy if exists "stock_notif_insert" on stock_notifications;
create policy "stock_notif_insert" on stock_notifications for insert with check (true);
drop policy if exists "stock_notif_admin" on stock_notifications;
create policy "stock_notif_admin" on stock_notifications for all using (is_admin()) with check (is_admin());

-- promo codes & gift cards: admin only (validation happens server-side via service role)
drop policy if exists "promo_admin" on promo_codes;
create policy "promo_admin" on promo_codes for all using (is_admin()) with check (is_admin());
drop policy if exists "giftcards_admin" on gift_cards;
create policy "giftcards_admin" on gift_cards for all using (is_admin()) with check (is_admin());

-- ops tables: admin only
drop policy if exists "inventory_admin" on inventory_logs;
create policy "inventory_admin" on inventory_logs for all using (is_admin()) with check (is_admin());
drop policy if exists "audit_admin" on audit_log;
create policy "audit_admin" on audit_log for all using (is_admin()) with check (is_admin());
drop policy if exists "adminnotif_admin" on admin_notifications;
create policy "adminnotif_admin" on admin_notifications for all using (is_admin()) with check (is_admin());
