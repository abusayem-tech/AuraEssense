-- Curated layering + suggested perfumes (admin-picked, shown on the PDP).

alter table pairs_with
  add column if not exists position integer not null default 0;

delete from pairs_with where product_id = related_product_id;

alter table pairs_with drop constraint if exists pairs_with_no_self;
alter table pairs_with
  add constraint pairs_with_no_self check (product_id <> related_product_id);

create index if not exists idx_pairs_with_related on pairs_with(related_product_id);

create table if not exists suggested_products (
  product_id uuid not null references products(id) on delete cascade,
  suggested_product_id uuid not null references products(id) on delete cascade,
  position integer not null default 0,
  primary key (product_id, suggested_product_id),
  constraint suggested_products_no_self check (product_id <> suggested_product_id)
);

create index if not exists idx_suggested_products_suggested
  on suggested_products(suggested_product_id);

alter table suggested_products enable row level security;

drop policy if exists "suggested_products_read" on suggested_products;
create policy "suggested_products_read" on suggested_products
  for select using (true);

drop policy if exists "suggested_products_admin" on suggested_products;
create policy "suggested_products_admin" on suggested_products
  for all using (is_admin()) with check (is_admin());
