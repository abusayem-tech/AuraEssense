-- ============================================================================
-- AuraEssence — Seed Data
-- Real, recognizable fragrances with accurate olfactory notes.
-- Prices (BDT), stock, SKUs, reviews and imagery are illustrative/dummy.
-- Images are royalty-free Unsplash placeholders (not trademarked brand photos).
-- Apply AFTER 0001_schema.sql and 0002_rls.sql.
-- ============================================================================

-- Store settings (singleton) ------------------------------------------------
insert into store_settings (id) values (true)
on conflict (id) do nothing;

-- Shipping zones ------------------------------------------------------------
insert into shipping_zones (name, zone, fee_bdt, free_ship_min, est_days) values
  ('Inside Dhaka', 'dhaka', 80, 8000, '1-2 days'),
  ('Outside Dhaka', 'outside', 150, 10000, '3-5 days')
on conflict do nothing;

-- Fragrance families --------------------------------------------------------
insert into fragrance_families (name, slug, description, accent_color) values
  ('Floral', 'floral', 'Romantic bouquets — rose, jasmine, peony and white blossoms.', '#b08a8a'),
  ('Woody', 'woody', 'Warm and grounding — sandalwood, cedar, vetiver and oud.', '#8a6d4a'),
  ('Amber', 'amber', 'Opulent and sensual — amber, vanilla, resins and spice.', '#c8a96a'),
  ('Fresh', 'fresh', 'Crisp and airy — marine accords, green leaves and dewy florals.', '#4f7d6b'),
  ('Citrus', 'citrus', 'Bright and effervescent — bergamot, lemon and mandarin.', '#cBA84f'),
  ('Gourmand', 'gourmand', 'Edible indulgence — vanilla, praline, coffee and caramel.', '#9a6b4a'),
  ('Chypre', 'chypre', 'Sophisticated contrast — bergamot, oakmoss and patchouli.', '#6b7d4f'),
  ('Aromatic', 'aromatic', 'Herbaceous and masculine — lavender, sage and spice.', '#5a6b6b')
on conflict (slug) do nothing;

-- Brands --------------------------------------------------------------------
insert into brands (name, slug, country, description) values
  ('Chanel', 'chanel', 'France', 'The house of timeless Parisian elegance.'),
  ('Dior', 'dior', 'France', 'Couture artistry translated into modern fragrance.'),
  ('Tom Ford', 'tom-ford', 'USA', 'Bold, sensual and unapologetically luxurious.'),
  ('Yves Saint Laurent', 'ysl', 'France', 'Provocative glamour and rebellious sophistication.'),
  ('Creed', 'creed', 'United Kingdom', 'A storied maison of artisanal niche perfumery.'),
  ('Maison Francis Kurkdjian', 'mfk', 'France', 'Contemporary haute parfumerie by a modern master.'),
  ('Le Labo', 'le-labo', 'USA', 'Hand-blended, soulful fragrances crafted in the moment.'),
  ('Jo Malone London', 'jo-malone', 'United Kingdom', 'Elegant simplicity and the art of scent combining.'),
  ('Byredo', 'byredo', 'Sweden', 'Minimalist Scandinavian luxury and emotional memory.'),
  ('Giorgio Armani', 'armani', 'Italy', 'Refined Italian sensuality and effortless style.'),
  ('Versace', 'versace', 'Italy', 'Glamorous, vibrant and boldly Mediterranean.'),
  ('Paco Rabanne', 'paco-rabanne', 'Spain', 'Audacious, metallic and magnetic modernity.'),
  ('Carolina Herrera', 'carolina-herrera', 'Venezuela', 'Daring femininity with couture spirit.'),
  ('Lancome', 'lancome', 'France', 'French joie de vivre bottled in light.'),
  ('Viktor & Rolf', 'viktor-rolf', 'Netherlands', 'Avant-garde fashion houses art of provocation.'),
  ('Hermes', 'hermes', 'France', 'Understated luxury and impeccable craftsmanship.')
on conflict (slug) do nothing;

-- Products (staged in a temp table, then expanded to variants + images) ------
create temporary table _seed (
  code text, slug text, name text, brand_slug text, family_slug text,
  gender gender_t, conc concentration_t, descr text, story text,
  top text[], heart text[], base_n text[], season text[], occasion text[],
  longevity int, sillage int, featured bool, base_price int, img_i int
);

insert into _seed values
('CHN5','chanel-no-5','No. 5','chanel','floral','women','EDP',
 'The most iconic fragrance in the world — an abstract, powdery floral aldehyde of legendary status.',
 'Created in 1921, No. 5 was the first perfume to bear a designers name and redefined modern perfumery forever.',
 array['Aldehydes','Ylang-Ylang','Neroli','Bergamot'], array['Jasmine','May Rose','Lily of the Valley','Iris'], array['Sandalwood','Vanilla','Vetiver','Amber'],
 array['Autumn','Winter'], array['Evening','Special'],5,4,true,16500,0),

('CHCM','chanel-coco-mademoiselle','Coco Mademoiselle','chanel','chypre','women','EDP',
 'A vibrant, sparkling oriental for the free-spirited modern woman.',
 'An audacious reinterpretation of the original Coco — fresh, sensual and impossibly chic.',
 array['Orange','Bergamot','Mandarin'], array['Jasmine','May Rose','Litchi'], array['Patchouli','Vetiver','White Musk','Vanilla'],
 array['Spring','Autumn'], array['Daily','Date','Office'],4,4,true,15500,1),

('CHBL','chanel-bleu-de-chanel','Bleu de Chanel','chanel','woody','men','EDP',
 'A magnetic woody-aromatic that captures freedom and determination.',
 'An ode to the man who refuses to conform — clean, deep and timeless.',
 array['Grapefruit','Lemon','Mint','Pink Pepper'], array['Ginger','Nutmeg','Jasmine'], array['Incense','Vetiver','Cedar','Sandalwood'],
 array['Spring','Autumn','Winter'], array['Office','Evening','Daily'],4,4,true,15800,2),

('DRSV','dior-sauvage','Sauvage','dior','aromatic','men','EDT',
 'A radically fresh composition — raw and noble at once, inspired by wide-open spaces.',
 'Sauvage is a powerful freshness conjured from blue skies over white-hot rocky landscapes.',
 array['Calabrian Bergamot','Pepper'], array['Sichuan Pepper','Lavender','Geranium','Elemi'], array['Ambroxan','Cedar','Labdanum'],
 array['Spring','Summer'], array['Daily','Office','Date'],4,4,true,11500,3),

('DRJA','dior-jadore','Jadore','dior','floral','women','EDP',
 'A glowing, voluptuous bouquet — the absolute femininity of flowers.',
 'A golden ode to womanhood, radiant and sensual in full floral bloom.',
 array['Pear','Melon','Magnolia','Bergamot'], array['Jasmine','Rose','Tuberose','Orchid'], array['Musk','Vanilla','Blackberry','Cedar'],
 array['Spring','Summer'], array['Evening','Special','Date'],4,4,true,14500,4),

('DRMD','dior-miss-dior','Miss Dior','dior','floral','women','EDP',
 'A tender, luminous floral woven like a declaration of love.',
 'A couture bouquet of a thousand flowers, sparkling and joyfully romantic.',
 array['Blood Orange','Mandarin'], array['Peony','Grasse Rose','Lily of the Valley'], array['Rosewood','Patchouli','Musk'],
 array['Spring'], array['Daily','Date'],3,3,false,13500,5),

('TFOW','tom-ford-oud-wood','Oud Wood','tom-ford','woody','unisex','EDP',
 'A smooth, smoky composition of rare oud, exotic spice and warm woods.',
 'One of the rarest ingredients in a perfumers arsenal, reimagined with refined restraint.',
 array['Rosewood','Cardamom','Sichuan Pepper'], array['Oud','Sandalwood','Vetiver'], array['Tonka Bean','Vanilla','Amber'],
 array['Autumn','Winter'], array['Evening','Special'],4,4,true,32000,6),

('TFTV','tom-ford-tobacco-vanille','Tobacco Vanille','tom-ford','amber','unisex','EDP',
 'An opulent, smoldering blend of tobacco leaf and sweet spices.',
 'A modern take on an old-world mens club — warm, woody and decadently spicy.',
 array['Tobacco Leaf','Aromatic Spices'], array['Tonka Bean','Tobacco Blossom','Vanilla'], array['Dried Fruits','Woody Notes'],
 array['Winter'], array['Evening','Special'],5,5,true,34000,7),

('TFBO','tom-ford-black-orchid','Black Orchid','tom-ford','amber','unisex','EDP',
 'A luxurious, sensual fragrance of rich, dark accords and an alluring potion.',
 'Mysterious and seductive — black orchids and spice meet noble woods.',
 array['Truffle','Gardenia','Blackcurrant','Bergamot'], array['Orchid','Spices','Lotus Wood'], array['Patchouli','Vanilla','Incense','Dark Chocolate'],
 array['Autumn','Winter'], array['Evening','Special'],5,5,false,28000,0),

('YSBO','ysl-black-opium','Black Opium','ysl','gourmand','women','EDP',
 'An addictive gourmand with a rock-and-roll spirit and a heart of black coffee.',
 'The seductive thrill of a midnight rush — sweet, dark and electric.',
 array['Pink Pepper','Orange Blossom','Pear'], array['Coffee','Jasmine'], array['Vanilla','Patchouli','Cedar'],
 array['Autumn','Winter'], array['Evening','Date'],4,4,true,12500,1),

('YSLB','ysl-libre','Libre','ysl','floral','women','EDP',
 'The tension of cool lavender and sensual orange blossom — the scent of freedom.',
 'A bold floral that captures a woman who lives by her own rules.',
 array['Lavender','Mandarin','Blackcurrant'], array['Orange Blossom','Jasmine','Lavender'], array['Vanilla','Musk','Cedar','Amber'],
 array['Spring','Autumn'], array['Daily','Evening'],4,4,false,13000,2),

('YSLY','ysl-y-edp','Y','ysl','aromatic','men','EDP',
 'The scent of self-made success — fresh, woody and powerfully modern.',
 'White meets black: the contrast of clean freshness and deep sensuality.',
 array['Apple','Ginger','Bergamot'], array['Sage','Juniper','Geranium'], array['Amberwood','Tonka Bean','Cedar'],
 array['Spring','Summer','Autumn'], array['Office','Daily'],4,3,false,12800,3),

('CRAV','creed-aventus','Aventus','creed','chypre','men','EDP',
 'A bold, fruity-smoky icon celebrating strength, vision and success.',
 'Inspired by the dramatic life of a historic emperor — the most acclaimed niche fragrance of its era.',
 array['Bergamot','Blackcurrant','Apple','Pineapple'], array['Birch','Patchouli','Rose','Jasmine'], array['Musk','Oakmoss','Ambergris','Vanilla'],
 array['Spring','Summer','Autumn'], array['Office','Special','Date'],5,5,true,42000,4),

('CRGI','creed-green-irish-tweed','Green Irish Tweed','creed','aromatic','men','EDP',
 'A timeless, verdant classic — crisp violet leaf over warm ambergris.',
 'A refined country gentleman in a bottle, beloved for generations.',
 array['Lemon Verbena','Peppermint'], array['Violet Leaf','Iris'], array['Sandalwood','Ambergris'],
 array['Spring','Summer'], array['Office','Daily'],4,3,false,40000,5),

('MFBR','mfk-baccarat-rouge-540','Baccarat Rouge 540','mfk','amber','unisex','EDP',
 'A luminous, crystalline signature — airy yet intensely radiant.',
 'A jeweled composition of saffron, amber and cedar; a modern legend.',
 array['Saffron','Jasmine'], array['Amberwood','Ambergris'], array['Fir Resin','Cedar'],
 array['Autumn','Winter'], array['Evening','Special'],5,5,true,38000,6),

('LLS3','le-labo-santal-33','Santal 33','le-labo','woody','unisex','EDP',
 'A smoky, leathery sandalwood that became the scent of a generation.',
 'Hand-blended in store — an addictive, unisex modern classic.',
 array['Violet','Cardamom'], array['Iris','Ambrox'], array['Sandalwood','Cedarwood','Leather','Musk'],
 array['Autumn','Winter'], array['Daily','Evening'],4,4,true,30000,7),

('JMWS','jo-malone-wood-sage-sea-salt','Wood Sage & Sea Salt','jo-malone','fresh','unisex','EDC',
 'The windswept freedom of the shoreline — mineral, green and breezy.',
 'Escape the everyday: salty air, earthy sage and the wild coast.',
 array['Ambrette Seeds'], array['Sea Salt'], array['Sage','Driftwood'],
 array['Spring','Summer'], array['Daily','Office'],3,3,false,11500,0),

('JMEP','jo-malone-english-pear-freesia','English Pear & Freesia','jo-malone','fresh','women','EDC',
 'The essence of autumn — succulent pears wrapped in a bouquet of freesia.',
 'A mellow, golden harvest of just-ripe pear and delicate white flowers.',
 array['King William Pear','Melon'], array['Freesia','Rose'], array['Patchouli','Amber','Woods'],
 array['Autumn'], array['Daily','Office'],3,3,false,11500,1),

('BYGW','byredo-gypsy-water','Gypsy Water','byredo','woody','unisex','EDP',
 'A romanticized vision of bohemian life — woody, fresh and softly sweet.',
 'The free-spirited beauty of nomadic culture captured in scent.',
 array['Bergamot','Lemon','Pepper','Juniper'], array['Incense','Pine Needle','Orris'], array['Amber','Sandalwood','Vanilla'],
 array['Spring','Autumn'], array['Daily','Evening'],3,3,false,26000,2),

('BYMG','byredo-mojave-ghost','Mojave Ghost','byredo','woody','unisex','EDP',
 'A soft, ethereal woody-floral inspired by a flower that blooms in the desert.',
 'Resilience and beauty in the harshest of landscapes.',
 array['Ambrette','Sapodilla'], array['Violet','Sandalwood','Magnolia'], array['Cedar','Chantilly Musk','Ambrette'],
 array['Spring','Summer'], array['Daily'],3,3,false,26000,3),

('ARAG','armani-acqua-di-gio','Acqua di Gio','armani','fresh','men','EDT',
 'An aquatic legend — the freshness of the sea, sun and Mediterranean air.',
 'Inspired by an island escape; effortless, breezy and endlessly wearable.',
 array['Bergamot','Neroli','Green Tangerine'], array['Jasmine','Rosemary','Sea Notes'], array['Patchouli','Cedar','Musk'],
 array['Spring','Summer'], array['Daily','Office'],3,3,true,10500,4),

('ARSI','armani-si','Si','armani','chypre','women','EDP',
 'A modern chypre celebrating irresistible, confident femininity.',
 'Say yes to yourself — a blend of grace, strength and free spirit.',
 array['Blackcurrant'], array['Rose','Freesia'], array['Vanilla','Patchouli','Woods','Musk'],
 array['Autumn','Winter'], array['Evening','Date'],4,4,false,12500,5),

('VSER','versace-eros','Eros','versace','aromatic','men','EDT',
 'A passionate, vibrant fragrance for a strong and luminous man.',
 'Named for the Greek god of love — fresh, sweet and magnetic.',
 array['Mint','Green Apple','Lemon'], array['Tonka Bean','Geranium','Ambroxan'], array['Vanilla','Vetiver','Cedar','Oakmoss'],
 array['Autumn','Winter'], array['Evening','Date'],4,5,true,9500,6),

('VSDB','versace-dylan-blue','Dylan Blue','versace','aromatic','men','EDT',
 'A contemporary aromatic-fougere of charismatic, magnetic energy.',
 'Bold, vibrant and unmistakably Versace.',
 array['Bergamot','Grapefruit','Fig Leaf'], array['Violet Leaf','Papyrus','Patchouli'], array['Musk','Tonka Bean','Saffron','Incense'],
 array['Spring','Summer'], array['Daily','Office'],4,4,false,9000,7),

('PR1M','paco-rabanne-1-million','1 Million','paco-rabanne','amber','men','EDT',
 'A bold, glamorous and provocative scent dressed in gold.',
 'Audacious luxury — fresh, spicy and seductively leathery.',
 array['Grapefruit','Mint','Blood Mandarin'], array['Rose','Cinnamon','Spices'], array['Leather','Amber','Woody Notes'],
 array['Autumn','Winter'], array['Evening','Date'],4,4,false,9800,0),

('PRIN','paco-rabanne-invictus','Invictus','paco-rabanne','fresh','men','EDT',
 'A fresh, addictive contrast of marine accord and sensual woods.',
 'The scent of victory — energetic, modern and irresistible.',
 array['Grapefruit','Marine Notes'], array['Bay Leaf','Jasmine'], array['Guaiac Wood','Oakmoss','Ambergris'],
 array['Spring','Summer'], array['Daily','Office'],3,4,false,9600,1),

('CHGG','carolina-herrera-good-girl','Good Girl','carolina-herrera','amber','women','EDP',
 'A daring duality of light and dark in an iconic stiletto bottle.',
 'Its so good to be bad — sweet almond and dark coffee in seductive balance.',
 array['Almond','Coffee'], array['Tuberose','Jasmine Sambac'], array['Tonka Bean','Cacao','Vanilla'],
 array['Autumn','Winter'], array['Evening','Date'],4,4,true,12500,2),

('LCLB','lancome-la-vie-est-belle','La Vie Est Belle','lancome','gourmand','women','EDP',
 'A radiant gourmand expressing the beauty of a free, happy life.',
 'A universal declaration of happiness — sweet iris and praline.',
 array['Blackcurrant','Pear'], array['Iris','Jasmine','Orange Blossom'], array['Praline','Vanilla','Patchouli','Tonka Bean'],
 array['Autumn','Winter'], array['Evening','Daily'],4,4,true,12800,3),

('VRFB','viktor-rolf-flowerbomb','Flowerbomb','viktor-rolf','floral','women','EDP',
 'An explosion of flowers that turns the everyday into a celebration.',
 'A floral bomb of jasmine, rose and orchid wrapped in sweet warmth.',
 array['Tea','Bergamot'], array['Jasmine','Rose','Orchid','Freesia'], array['Patchouli','Musk','Vanilla'],
 array['Autumn','Winter'], array['Evening','Special'],4,5,false,13500,4),

('HRTH','hermes-terre-dhermes','Terre dHermes','hermes','woody','men','EDT',
 'A poetic, mineral woody journey from earth to sky.',
 'A symbolic narrative of raw materials — orange, flint and vetiver.',
 array['Orange','Grapefruit'], array['Pepper','Pelargonium','Flint'], array['Vetiver','Cedar','Patchouli','Benzoin'],
 array['Spring','Autumn'], array['Office','Daily'],4,4,false,13800,5);

-- Expand: products
insert into products (sku_base, slug, name, brand_id, family_id, gender, concentration,
  description, story, top_notes, heart_notes, base_notes, season, occasion,
  longevity, sillage, is_featured, search_text)
select s.code, s.slug, s.name, b.id, f.id, s.gender, s.conc,
  s.descr, s.story, s.top, s.heart, s.base_n, s.season, s.occasion,
  s.longevity, s.sillage, s.featured,
  lower(s.name || ' ' || (select name from brands where id=b.id) || ' ' ||
    array_to_string(s.top,' ') || ' ' || array_to_string(s.heart,' ') || ' ' || array_to_string(s.base_n,' '))
from _seed s
join brands b on b.slug = s.brand_slug
join fragrance_families f on f.slug = s.family_slug
on conflict (slug) do nothing;

-- Expand: variants (8ml sample, 50ml, 100ml). Featured items get a sale on 50ml.
insert into product_variants (product_id, size_ml, sku, price_bdt, sale_price_bdt, stock, is_sample)
select p.id, v.size_ml, p.sku_base || '-' || v.size_ml,
  round(s.base_price * v.mult)::int,
  case when v.size_ml = 50 and s.featured then round(s.base_price * 0.85)::int else null end,
  v.stock, v.is_sample
from products p
join _seed s on s.slug = p.slug
cross join (values
  (8, 0.20, 40, true),
  (50, 1.0, 30, false),
  (100, 1.70, 18, false)
) as v(size_ml, mult, stock, is_sample)
on conflict (sku) do nothing;

-- Expand: images (two per product from a rotating Unsplash pool)
with pool as (
  select array[
    'https://images.unsplash.com/photo-1541643600914-78b084683601',
    'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539',
    'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75',
    'https://images.unsplash.com/photo-1615634260167-c8cdede054de',
    'https://images.unsplash.com/photo-1594035910387-fea47794261f',
    'https://images.unsplash.com/photo-1587017539504-67cfbddac569',
    'https://images.unsplash.com/photo-1563170351-be82bc888aa4',
    'https://images.unsplash.com/photo-1610461888750-10bfc601b874'
  ] as urls
)
insert into product_images (product_id, url, alt, position)
select p.id,
  (select urls[(s.img_i % 8) + 1] from pool) || '?auto=format&fit=crop&w=900&q=80',
  p.name || ' bottle', 0
from products p join _seed s on s.slug = p.slug
union all
select p.id,
  (select urls[((s.img_i + 3) % 8) + 1] from pool) || '?auto=format&fit=crop&w=900&q=80',
  p.name || ' detail', 1
from products p join _seed s on s.slug = p.slug;

-- Collections ---------------------------------------------------------------
insert into collections (name, slug, subtitle, description, cover_image, is_featured, position) values
  ('Oud & Amber', 'oud-amber', 'Liquid gold', 'Opulent, resinous and unforgettable — our most luxurious warm scents.', 'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=80', true, 0),
  ('Modern Icons', 'modern-icons', 'The new classics', 'Contemporary masterpieces that define a generation.', 'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80', true, 1),
  ('Fresh Escapes', 'fresh-escapes', 'A breath of air', 'Crisp, aquatic and green — perfect for the everyday.', 'https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80', true, 2),
  ('Gifts for Him', 'gifts-for-him', 'Effortless gifting', 'Distinguished scents for the modern gentleman.', 'https://images.unsplash.com/photo-1594035910387-fea47794261f?auto=format&fit=crop&w=1200&q=80', true, 3),
  ('Gifts for Her', 'gifts-for-her', 'She will remember', 'Romantic florals and luminous signatures made for gifting.', 'https://images.unsplash.com/photo-1587017539504-67cfbddac569?auto=format&fit=crop&w=1200&q=80', true, 4),
  ('Date Night', 'date-night', 'After dark', 'Seductive, intimate compositions for evenings that linger.', 'https://images.unsplash.com/photo-1595425970377-c9703cf48b6d?auto=format&fit=crop&w=1200&q=80', false, 5)
on conflict (slug) do nothing;

insert into collection_products (collection_id, product_id, position)
select c.id, p.id, 0 from collections c, products p
where (c.slug='oud-amber' and p.slug in ('tom-ford-oud-wood','tom-ford-tobacco-vanille','mfk-baccarat-rouge-540','paco-rabanne-1-million','carolina-herrera-good-girl'))
   or (c.slug='modern-icons' and p.slug in ('creed-aventus','le-labo-santal-33','dior-sauvage','chanel-bleu-de-chanel','ysl-black-opium'))
   or (c.slug='fresh-escapes' and p.slug in ('armani-acqua-di-gio','jo-malone-wood-sage-sea-salt','paco-rabanne-invictus','jo-malone-english-pear-freesia'))
   or (c.slug='gifts-for-him' and p.slug in ('dior-sauvage','versace-eros','hermes-terre-dhermes','creed-aventus','chanel-bleu-de-chanel'))
   or (c.slug='gifts-for-her' and p.slug in ('chanel-coco-mademoiselle','ysl-black-opium','viktor-rolf-flowerbomb','jo-malone-english-pear-freesia','carolina-herrera-good-girl'))
   or (c.slug='date-night' and p.slug in ('tom-ford-tobacco-vanille','mfk-baccarat-rouge-540','ysl-black-opium','tom-ford-black-orchid','carolina-herrera-good-girl'))
on conflict do nothing;

-- Pairs with (layering) — curated first, then fill any product still missing a partner
insert into pairs_with (product_id, related_product_id, position)
select a.id, b.id, 0 from products a, products b
where (a.slug='tom-ford-oud-wood' and b.slug='tom-ford-tobacco-vanille')
   or (a.slug='le-labo-santal-33' and b.slug='byredo-gypsy-water')
   or (a.slug='mfk-baccarat-rouge-540' and b.slug='tom-ford-black-orchid')
   or (a.slug='chanel-coco-mademoiselle' and b.slug='viktor-rolf-flowerbomb')
on conflict do nothing;

insert into pairs_with (product_id, related_product_id, position)
select product_id, other_id, 0
from (
  select
    a.id as product_id,
    b.id as other_id,
    row_number() over (
      partition by a.id
      order by
        case when a.family_id is distinct from b.family_id then 0 else 1 end,
        b.name
    ) as rn
  from products a
  join products b on a.id <> b.id
) ranked
where rn = 1
  and not exists (select 1 from pairs_with pw where pw.product_id = ranked.product_id)
on conflict do nothing;

-- Suggested / related — same family first, then any other product
insert into suggested_products (product_id, suggested_product_id, position)
select product_id, other_id, 0
from (
  select
    a.id as product_id,
    b.id as other_id,
    row_number() over (
      partition by a.id
      order by
        case when a.family_id is not distinct from b.family_id then 0 else 1 end,
        b.name
    ) as rn
  from products a
  join products b on a.id <> b.id
) ranked
where rn = 1
  and not exists (
    select 1 from suggested_products sp where sp.product_id = ranked.product_id
  )
on conflict do nothing;

-- Promo codes ---------------------------------------------------------------
insert into promo_codes (code, type, value, min_order, usage_limit, active, expires_at) values
  ('WELCOME10', 'percent', 10, 5000, 1000, true, now() + interval '180 days'),
  ('AURA500', 'fixed', 500, 10000, 500, true, now() + interval '90 days'),
  ('FREESHIP', 'free_ship', 0, 6000, null, true, now() + interval '365 days')
on conflict (code) do nothing;

-- Gift cards ----------------------------------------------------------------
insert into gift_cards (code, initial_amount, balance, status) values
  ('GIFT-AURA-5000', 5000, 5000, 'active'),
  ('GIFT-AURA-10000', 10000, 10000, 'active')
on conflict (code) do nothing;

-- Quiz ----------------------------------------------------------------------
insert into quiz_questions (position, prompt, subtitle) values
  (0, 'Which mood calls to you?', 'There are no wrong answers — trust your instinct.'),
  (1, 'Choose a landscape to disappear into.', 'Where would you rather be right now?'),
  (2, 'Pick your moment.', 'When do you want your scent to shine?'),
  (3, 'What lingers longest in your memory?', 'The note that feels most like you.')
on conflict do nothing;

-- Quiz options with family weightings
insert into quiz_options (question_id, label, description, family_weights, note_weights, position)
select q.id, o.label, o.descr, o.fw::jsonb, o.nw::jsonb, o.pos
from quiz_questions q
join (values
  (0,'Bold & Magnetic','Command the room','{"amber":3,"woody":2,"chypre":1}','{"oud":2,"leather":1}',0),
  (0,'Soft & Romantic','Tender and luminous','{"floral":3,"gourmand":1}','{"rose":2,"jasmine":1}',1),
  (0,'Fresh & Free','Light on your feet','{"fresh":3,"citrus":2}','{"bergamot":2}',2),
  (0,'Warm & Cozy','Intimate and sweet','{"gourmand":3,"amber":2}','{"vanilla":2}',3),
  (1,'A cedar forest at dusk','{}','{"woody":3,"aromatic":1}','{"sandalwood":2,"cedar":1}',0),
  (1,'A sunlit citrus grove','{}','{"citrus":3,"fresh":1}','{"bergamot":2}',1),
  (1,'A blooming rose garden','{}','{"floral":3}','{"rose":3}',2),
  (1,'A spice market at night','{}','{"amber":3,"woody":1}','{"saffron":1,"oud":1}',3),
  (2,'Sunrise — quiet & clear','{}','{"fresh":3,"citrus":1}','{}',0),
  (2,'Midday — sharp & confident','{}','{"aromatic":2,"chypre":2}','{}',1),
  (2,'Golden hour — warm & open','{}','{"floral":2,"gourmand":1}','{}',2),
  (2,'Midnight — deep & daring','{}','{"amber":3,"woody":2}','{"oud":1}',3),
  (3,'Vanilla & praline','{}','{"gourmand":3,"amber":1}','{"vanilla":3}',0),
  (3,'Sea salt & driftwood','{}','{"fresh":3}','{"sea salt":2}',1),
  (3,'Smoky sandalwood','{}','{"woody":3,"amber":1}','{"sandalwood":3}',2),
  (3,'White petals','{}','{"floral":3}','{"jasmine":2}',3)
) as o(qpos, label, descr, fw, nw, pos) on o.qpos = q.position
on conflict do nothing;

-- Journal -------------------------------------------------------------------
insert into journal_posts (slug, title, excerpt, cover, body, author, published_at) values
  ('how-to-find-your-signature-scent', 'How to Find Your Signature Scent',
   'A perfumers guide to discovering the fragrance that feels unmistakably you.',
   'https://images.unsplash.com/photo-1592945403244-b3fbafd7f539?auto=format&fit=crop&w=1200&q=80',
   E'Finding a signature scent is a deeply personal journey...\n\nStart with fragrance families. Do you gravitate toward fresh citrus, warm amber, or romantic florals? Once you know your family, explore the notes within it.\n\nAlways test on skin, never paper. Your body chemistry transforms a fragrance over hours. Live with it for a full day before deciding.\n\nFinally, trust memory and emotion over trends. The best signature scent is the one that makes you feel most like yourself.',
   'Amara Rahman', now() - interval '5 days'),
  ('the-art-of-fragrance-layering', 'The Art of Fragrance Layering',
   'Combine scents like a master to create something entirely your own.',
   'https://images.unsplash.com/photo-1615634260167-c8cdede054de?auto=format&fit=crop&w=1200&q=80',
   E'Layering is the secret weapon of fragrance connoisseurs...\n\nThe rule of thumb: pair a simple, linear scent with a more complex one. Woody bases like Santal 33 love a bright citrus or rose on top.\n\nApply the heavier scent first, then the lighter one. Start subtle — you can always add more.',
   'Amara Rahman', now() - interval '12 days'),
  ('understanding-the-olfactory-pyramid', 'Understanding the Olfactory Pyramid',
   'Top, heart and base notes — and why your perfume smells different at midnight.',
   'https://images.unsplash.com/photo-1588405748880-12d1d2a59f75?auto=format&fit=crop&w=1200&q=80',
   E'Every fragrance unfolds in three acts...\n\nTop notes are the first impression — bright and fleeting. Heart notes emerge as the top fades, forming the character. Base notes are the lasting memory, rich and deep.\n\nUnderstanding this evolution helps you choose scents that perform beautifully from first spray to last trace.',
   'Tanvir Hasan', now() - interval '20 days')
on conflict (slug) do nothing;

-- Content pages -------------------------------------------------------------
insert into content_pages (slug, title, body) values
  ('about', 'Our Story', E'AuraEssence was born from a singular belief: that a fragrance is not an accessory, but a signature.\n\nWe curate the worlds most coveted houses and niche ateliers, bringing international luxury to Bangladesh with uncompromising authenticity. Every bottle is a chapter in a story — yours.'),
  ('faq', 'Frequently Asked Questions', E'Are your fragrances authentic?\nYes. Every product is 100% authentic and sourced responsibly.\n\nDo you deliver outside Dhaka?\nWe deliver nationwide via our logistics partners, typically within 3-5 days.\n\nCan I return a fragrance?\nUnopened products may be returned within 7 days. See our Shipping & Returns page.'),
  ('shipping-returns', 'Shipping & Returns', E'Delivery inside Dhaka: 1-2 business days. Outside Dhaka: 3-5 business days.\n\nFree shipping on orders above the threshold shown at checkout.\n\nReturns: unopened items within 7 days for a full refund.'),
  ('privacy', 'Privacy Policy', E'We respect your privacy. We never sell your data, and we never store payment credentials — all transactions are handled securely by our payment partner.'),
  ('terms', 'Terms of Service', E'By using AuraEssence you agree to our terms. All prices are in Bangladeshi Taka (BDT) and inclusive of applicable taxes unless stated otherwise.')
on conflict (slug) do nothing;

-- Banners -------------------------------------------------------------------
insert into banners (title, subtitle, image, link, cta_label, position, active) values
  ('Complimentary Discovery Set', 'On your first order above ৳ 15,000', null, '/fragrances', 'Shop Now', 0, true)
on conflict do nothing;

drop table if exists _seed;
