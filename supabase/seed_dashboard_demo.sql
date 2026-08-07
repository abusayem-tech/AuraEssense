-- ============================================================================
-- AuraEssence — Dashboard demo orders (recent, realistic activity)
-- Safe to re-run: deletes prior DEMO-seeded rows tagged via admin_notes, then reloads.
-- ============================================================================

-- Remove previous demo seed batch (keep real customer orders)
delete from order_events
where order_id in (select id from orders where admin_notes = 'demo-dashboard-seed');
delete from order_items
where order_id in (select id from orders where admin_notes = 'demo-dashboard-seed');
delete from loyalty_transactions
where order_id in (select id from orders where admin_notes = 'demo-dashboard-seed');
delete from orders where admin_notes = 'demo-dashboard-seed';

-- Fresh "new customers" in the last 30 days (for dashboard KPI)
with ranked as (
  select id,
         (array[2,4,6,9,11,14,18,21,25,28])[1 + ((row_number() over (order by full_name) - 1) % 10)] as days_ago
  from profiles
  where role = 'customer'
    and full_name in (
      'Aria Donnelly','Benjamin Frost','Camille Dubois','Dominic Shah',
      'Elias Brandt','Freya Andersen','Gabriel Moreau','Hannah Beaumont',
      'Ingrid Holm','Layla Hadid','Marcus Webb','Nadia Rahman'
    )
)
update profiles p
set created_at = now() - (r.days_ago || ' days')::interval
from ranked r
where p.id = r.id;

-- Low-stock alerts (threshold default = 5)
update product_variants set stock = 2 where sku in ('DRSV-50', 'VSER-50', 'PR1M-50');
update product_variants set stock = 3 where sku in ('CHBL-50', 'YSBO-50', 'ARAG-50');
update product_variants set stock = 4 where sku in ('JMWS-50', 'LCLB-50');
update product_variants set stock = 5 where sku in ('TFBO-50', 'CHGG-50');

do $$
declare
  cust uuid[];
  v_ids uuid[];
  v_product uuid[];
  v_name text[];
  v_brand text[];
  v_size int[];
  v_sku text[];
  v_price int[];
  v_img text[];
  n int;
  i int;
  j int;
  day_offset int;
  status order_status;
  zone zone_t;
  fee int;
  uid uuid;
  oid uuid;
  created timestamptz;
  paid timestamptz;
  subtotal int;
  discount int;
  gift int;
  total int;
  item_count int;
  vi int;
  qty int;
  unit int;
  line int;
  recipients text[] := array[
    'Sophia Bennett','Liam Carter','Olivia Hayes','Noah Brooks','Emma Sinclair',
    'Ava Whitfield','Mason Reed','Isabella Cross','Ethan Vaughn','Mia Fontaine',
    'Lucas Hale','Charlotte Pierce','Amelia Stone','Henry Lawson','Grace Aldridge',
    'Daniel Mercer','Chloe Harrington','Jack Donovan','Lily Ashford','Nadia Rahman',
    'Camille Dubois','Elias Brandt','Marcus Webb','Freya Andersen','Layla Hadid'
  ];
  phones text[] := array[
    '+8801711001001','+8801711001002','+8801711001003','+8801711001004','+8801711001005',
    '+8801812002001','+8801812002002','+8801812002003','+8801913003001','+8801913003002'
  ];
  areas_dhaka text[] := array['Gulshan','Banani','Dhanmondi','Uttara','Mirpur','Bashundhara','Wari'];
  areas_out text[] := array['Chittagong','Sylhet','Rajshahi','Khulna','Gazipur','Narayanganj'];
  statuses order_status[] := array[
    'delivered','delivered','delivered','delivered','delivered',
    'delivered','in_transit','in_transit','dispatched','processing',
    'paid','paid','failed','cancelled','delivered'
  ];
  -- Heavier recent days for a lively chart
  day_weights int[] := array[
    55,54,53,52,51,50,49,48,47,46,45,44,43,42,41,40,39,38,37,36,
    35,34,33,32,31,30,29,28,27,26,25,24,23,22,21,20,19,18,17,16,
    15,14,13,12,11,10,9,8,7,6,5,4,3,2,1,0,0,1,2,3
  ];
begin
  select array_agg(id order by full_name)
  into cust
  from (
    select id, full_name from profiles
    where role = 'customer'
    order by full_name
    limit 30
  ) c;

  select
    array_agg(variant_id),
    array_agg(product_id),
    array_agg(product_name),
    array_agg(brand_name),
    array_agg(size_ml),
    array_agg(sku),
    array_agg(unit_price),
    array_agg(image_url)
  into v_ids, v_product, v_name, v_brand, v_size, v_sku, v_price, v_img
  from (
    select v.id as variant_id, v.product_id, p.name as product_name, b.name as brand_name,
           v.size_ml, v.sku, coalesce(v.sale_price_bdt, v.price_bdt) as unit_price,
           (select url from product_images pi where pi.product_id = p.id order by position limit 1) as image_url
    from product_variants v
    join products p on p.id = v.product_id
    join brands b on b.id = p.brand_id
    where v.is_sample = false and v.size_ml in (50, 100)
    order by b.name, p.name, v.size_ml
  ) s;

  n := array_length(day_weights, 1);

  for i in 1..n loop
    day_offset := day_weights[i];
    -- Mix previous period (31-55d) and current (0-30d); day_weights already spans both
    created := date_trunc('day', now()) - (day_offset || ' days')::interval
               + ((8 + (i * 3) % 11) || ' hours')::interval
               + ((i * 7) % 50 || ' minutes')::interval;

    status := statuses[1 + ((i - 1) % array_length(statuses, 1))];
    -- Bias recent orders toward active fulfillment states
    if day_offset <= 3 and status in ('delivered','cancelled') then
      status := (array['paid','processing','dispatched','in_transit'])[1 + (i % 4)];
    end if;

    zone := case when i % 3 = 0 then 'outside'::zone_t else 'dhaka'::zone_t end;
    fee := case when zone = 'dhaka' then 80 else 150 end;
    uid := cust[1 + ((i - 1) % array_length(cust, 1))];

    item_count := 1 + (i % 3); -- 1..3 lines
    subtotal := 0;

    insert into orders (
      user_id, status, subtotal, delivery_fee, discount, gift_wrap_fee, loyalty_redeemed,
      total, promo_code, is_gift, ssl_transaction_id, paperfly_tracking_id,
      recipient, phone, email, address_line, area, city, zone,
      admin_notes, created_at, paid_at, updated_at
    ) values (
      uid,
      status,
      0, fee, 0, 0, 0,
      0,
      case when i % 7 = 0 then 'WELCOME10' when i % 11 = 0 then 'AURA500' else null end,
      (i % 9 = 0),
      case when status in ('failed','cancelled','pending') then null else 'MOCK-DEMO-' || i end,
      case when status in ('dispatched','in_transit','delivered') then 'PF-DEMO-' || lpad(i::text, 5, '0') else null end,
      recipients[1 + ((i - 1) % array_length(recipients, 1))],
      phones[1 + ((i - 1) % array_length(phones, 1))],
      (select email from auth.users where id = uid),
      case when zone = 'dhaka'
        then (100 + i)::text || ' Road ' || (1 + (i % 12))::text
        else 'House ' || (10 + i)::text || ', Block ' || chr(65 + (i % 5))
      end,
      case when zone = 'dhaka'
        then areas_dhaka[1 + ((i - 1) % array_length(areas_dhaka, 1))]
        else areas_out[1 + ((i - 1) % array_length(areas_out, 1))]
      end,
      case when zone = 'dhaka' then 'Dhaka' else areas_out[1 + ((i - 1) % array_length(areas_out, 1))] end,
      zone,
      'demo-dashboard-seed',
      created,
      case when status in ('paid','processing','dispatched','in_transit','delivered','refunded')
        then created + interval '4 minutes' else null end,
      created
    ) returning id into oid;

    for j in 1..item_count loop
      vi := 1 + ((i * 3 + j * 5) % array_length(v_ids, 1));
      qty := 1 + ((i + j) % 2); -- 1 or 2
      unit := v_price[vi];
      line := unit * qty;
      subtotal := subtotal + line;

      insert into order_items (
        order_id, product_id, variant_id, product_name, brand_name,
        size_ml, sku, unit_price, qty, image_url
      ) values (
        oid, v_product[vi], v_ids[vi], v_name[vi], v_brand[vi],
        v_size[vi], v_sku[vi], unit, qty, v_img[vi]
      );
    end loop;

    discount := case
      when i % 7 = 0 then round(subtotal * 0.10)::int
      when i % 11 = 0 then 500
      else 0
    end;
    gift := case when i % 9 = 0 then 250 else 0 end;
    -- Free ship over threshold
    if (zone = 'dhaka' and subtotal - discount >= 8000)
       or (zone = 'outside' and subtotal - discount >= 10000) then
      fee := 0;
    end if;
    total := greatest(subtotal - discount + fee + gift, 0);

    update orders
    set subtotal = subtotal,
        discount = discount,
        delivery_fee = fee,
        gift_wrap_fee = gift,
        total = total
    where id = oid;

    -- Timeline events
    insert into order_events (order_id, status, note, created_at) values
      (oid, 'pending', 'Order placed', created);

    if status = 'failed' then
      insert into order_events (order_id, status, note, created_at) values
        (oid, 'failed', 'Payment declined (demo)', created + interval '3 minutes');
    elsif status = 'cancelled' then
      insert into order_events (order_id, status, note, created_at) values
        (oid, 'cancelled', 'Customer cancelled (demo)', created + interval '20 minutes');
    else
      paid := created + interval '4 minutes';
      insert into order_events (order_id, status, note, created_at) values
        (oid, 'paid', 'Payment confirmed', paid);

      if status in ('processing','dispatched','in_transit','delivered') then
        insert into order_events (order_id, status, note, created_at) values
          (oid, 'processing', 'Picking & packing', paid + interval '2 hours');
      end if;
      if status in ('dispatched','in_transit','delivered') then
        insert into order_events (order_id, status, note, created_at) values
          (oid, 'dispatched', 'Handed to courier', paid + interval '1 day');
      end if;
      if status in ('in_transit','delivered') then
        insert into order_events (order_id, status, note, created_at) values
          (oid, 'in_transit', 'Out for delivery', paid + interval '2 days');
      end if;
      if status = 'delivered' then
        insert into order_events (order_id, status, note, created_at) values
          (oid, 'delivered', 'Delivered successfully', paid + interval '3 days');
      end if;
    end if;
  end loop;
end $$;

-- A few admin notifications so the bell isn't empty
insert into admin_notifications (type, title, body, link, created_at)
select * from (values
  ('order', 'New paid order', 'A demo order was marked paid and is ready to fulfill.', '/admin/orders', now() - interval '25 minutes'),
  ('inventory', 'Low stock alert', 'Sauvage 50ml is down to 2 units.', '/admin/inventory', now() - interval '2 hours'),
  ('order', 'Fulfillment queue busy', 'Several paid & processing orders await dispatch.', '/admin/orders', now() - interval '5 hours')
) as v(type, title, body, link, created_at)
where not exists (
  select 1 from admin_notifications n where n.title = v.title and n.body = v.body
);

-- Summary
select
  (select count(*) from orders where admin_notes = 'demo-dashboard-seed') as demo_orders,
  (select count(*) from orders where created_at >= now() - interval '30 days'
     and status in ('paid','processing','dispatched','in_transit','delivered')) as paid_like_30d,
  (select coalesce(sum(total),0) from orders where created_at >= now() - interval '30 days'
     and status in ('paid','processing','dispatched','in_transit','delivered')) as revenue_30d,
  (select count(*) from product_variants where stock <= 5 and is_sample = false) as low_stock_skus;
