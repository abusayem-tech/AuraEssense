-- Admin hide/unhide for reviews. Hidden reviews stay in the database but
-- are excluded from the storefront and from product rating rollups.

alter table reviews
  add column if not exists is_hidden boolean not null default false;

create index if not exists idx_reviews_storefront
  on reviews(product_id)
  where status = 'approved' and not is_hidden;

create or replace function recalc_product_rating()
returns trigger language plpgsql security definer set search_path = public as $$
declare
  pid uuid;
begin
  pid := coalesce(new.product_id, old.product_id);
  update products p set
    rating_avg = coalesce((
      select round(avg(rating)::numeric, 1) from reviews
      where product_id = pid and status = 'approved' and not is_hidden
    ), 0),
    rating_count = (
      select count(*) from reviews
      where product_id = pid and status = 'approved' and not is_hidden
    )
  where p.id = pid;
  return null;
end; $$;

drop policy if exists "reviews_read" on reviews;
create policy "reviews_read" on reviews for select
  using (
    (status = 'approved' and not is_hidden)
    or auth.uid() = user_id
    or is_admin()
  );
