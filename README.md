# AuraEssence — Luxury Perfume E-Commerce

A dark-luxury perfume e-commerce platform for the Bangladeshi market, built with **Next.js 16 (App Router)**, **Supabase** (PostgreSQL, Auth, Storage, RLS), **Tailwind CSS v4**, and deployable on **Vercel**.

Prices in **BDT (৳)**. Payments (**SSL Commerze**) and logistics (**Paperfly**) are mocked by default behind swappable interfaces.

---

## Tech Stack

- **Next.js 16** (App Router, RSC, Server Actions) + TypeScript + React 19
- **Supabase** (PostgreSQL + RLS, Auth, Storage)
- **Tailwind CSS v4**, Radix UI, Framer Motion, Recharts, Lucide, Embla
- **Zustand** (cart), **nuqs** (URL filters), Zod + React Hook Form
- **Vercel**-oriented deploy; `next-themes` light/dark

---

## Customer Features (Storefront)

### Home & global chrome
| Feature | Route / location | Description |
|---|---|---|
| Cinematic home | `/` | Parallax hero, brand marquee, featured products, collection teasers, scent-quiz CTA, olfactory-family explorer, journal preview |
| Header nav | Global | Fragrances, Brands, Collections, Scent Quiz, Journal; search, wishlist, account, cart badge, theme toggle |
| Mobile nav | Global | Sheet navigation for small screens |
| Slide-over cart | Global | Persistent bag (Zustand + localStorage); qty/remove; free-shipping progress; checkout CTA |
| ⌘K command search | Global | Product + brand search via `GET /api/search` |
| Theme toggle | Global | Light / dark (`next-themes`) |
| Footer | Global | Shop / House / Care / Legal links, newsletter, social, contact |
| Toasts & route progress | Global | Feedback toasts; subtle navigation progress |

### Catalog & discovery
| Feature | Route | Description |
|---|---|---|
| All fragrances | `/fragrances` | Paginated grid (12/page), empty state |
| Multi-parameter filters | `/fragrances` | URL-synced: brand, gender, concentration, family, season, occasion, olfactory notes, price min/max, samples-only |
| Sorting | `/fragrances` | Featured, newest, price asc/desc, rating |
| Active filter chips | `/fragrances` | Clear individual filters; desktop + mobile filter UIs |
| Text | `/fragrances?q=` + ⌘K | Catalog text search + command palette |
| Brands index | `/brands` | Maison grid with country |
| Brand page | `/brands/[slug]` | Brand story + products |
| Collections index | `/collections` | Curated sets |
| Collection page | `/collections/[slug]` | Collection products |
| Product cards | Catalog grids | Hover image swap, sale/featured/sold-out badges, rating, price, wishlist heart, quick-add |
| Discovery samples | `/fragrances?samples=1` | Sample variants + samples-only filter |
| Gender shortcuts | Footer links | For Him / Her / Unisex |

### Product detail (PDP)
| Feature | Route | Description |
|---|---|---|
| Product page | `/fragrances/[slug]` | Breadcrumbs, brand, gender/concentration badges, description |
| Image gallery + zoom | PDP | Thumbnails + mouse zoom |
| Size / variant selector | PDP | 30/50/100ml + discovery samples; sale price & % off |
| Add to bag & quantity | PDP | Low-stock warning |
| Back-in-stock alerts | PDP | Email notify when a sold-out variant returns |
| Wishlist toggle | PDP / cards | Save / remove (auth) |
| Longevity & sillage meters | PDP | Spec meters |
| Olfactory pyramid | PDP | Animated top / heart / base notes |
| Layering (“pairs well with”) | PDP | Recommended pairings |
| Related products | PDP | “You may also like” |
| Reviews | PDP | Aggregate rating, distribution, verified-purchase list; submit (auth); helpful votes |
| Trust row | PDP | Authentic / nationwide delivery / easy returns |
| SEO | PDP | JSON-LD Product schema + Open Graph |
| Image fallback | Global media | On-brand placeholder if remote image fails |

### Scent Profile Quiz
| Feature | Route | Description |
|---|---|---|
| Multi-step quiz | `/quiz` | Weighted questions → top-3 in-stock fragrance matches; restart |

### Cart & checkout
| Feature | Route | Description |
|---|---|---|
| Checkout | `/checkout` | Contact & delivery; guest or signed-in |
| Delivery zones | Checkout | Dhaka / Outside + fees |
| Free shipping threshold | Checkout / cart | From store settings (default ৳8000) |
| Promo codes | Checkout | Percent, fixed, free-shipping (preview + apply) |
| Gift cards | Checkout | Balance applied at checkout |
| Gift wrapping | Checkout | Paid wrap + personal message |
| Loyalty redemption | Checkout | Points as BDT off (signed-in) |
| Zero-total checkout | Checkout | Gift card / loyalty can skip payment gateway |
| Mock SSL Commerze pay | `/checkout/mock-pay` | Simulate success / fail / cancel |
| Order success | `/checkout/success` | Confirmation; clears cart |
| Payment fail / cancel | `/checkout/fail`, `/checkout/cancel` | Failure paths |

### Auth
| Feature | Route | Description |
|---|---|---|
| Login | `/login` | Email/password + Google OAuth; redirect support |
| Sign up | `/signup` | Account creation |
| Forgot password | `/forgot-password` | Reset request |
| Update password | `/update-password` | Set new password |
| OAuth callback | `/auth/callback` | Supabase session exchange |
| Sign out | `/auth/signout` | Ends session |
| Cookie sessions | Middleware | HTTP-only cookies; guards `/account` |

### Account (authenticated)
| Feature | Route | Description |
|---|---|---|
| Overview | `/account` | Loyalty / orders / wishlist stats; recent orders; admin shortcut if role=`admin` |
| Order history | `/account/orders` | Status badges; track order |
| Order detail | `/account/orders/[id]` | Line items, address, Paperfly AWB, **visual tracking timeline**, totals |
| Wishlist | `/account/wishlist` | Saved products grid |
| Addresses | `/account/addresses` | Add / delete / set default; zone; checkout prefill |
| Loyalty / Rewards | `/account/loyalty` | Balance (1 pt ≈ ৳1), ~2% earn, transaction history |
| Profile | `/account/profile` | Update name & phone (email read-only) |

### Editorial & content
| Feature | Route | Description |
|---|---|---|
| Journal index | `/journal` | Articles list |
| Journal article | `/journal/[slug]` | Full post |
| About | `/about` | CMS page |
| FAQ | `/faq` | CMS page |
| Shipping & Returns | `/shipping-returns` | CMS page |
| Privacy | `/privacy` | CMS page |
| Terms | `/terms` | CMS page |
| Contact | `/contact` | Concierge details + contact form |

### Engagement
| Feature | Location | Description |
|---|---|---|
| Newsletter subscribe | Footer | Source-tagged signup |
| Contact form | `/contact` | Inquiry → admin notification |
| Sale pricing | Catalog / PDP | Strike-through + % off |
| Order status (visible) | Account | pending → paid → processing → dispatched → in_transit → delivered (+ cancelled / failed / refunded) |

---

## Admin Features (`/admin`, role-gated)

Access: authenticated users with `profiles.role = 'admin'`. Roles are binary (`customer` | `admin`) — no staff/superadmin tiers.

### Dashboard & analytics
| Feature | Route | Description |
|---|---|---|
| Dashboard | `/admin` | 30-day KPIs (revenue, orders, AOV, new customers + trends); revenue chart; top brands; fulfillment queue; low-stock alerts; recent orders |
| Sales & Analytics | `/admin/analytics` | Ranges 7 / 30 / 90 days; revenue, orders, AOV, units, repeat rate, new customers, failed payments, inventory valuation; revenue chart; sales by brand & zone; best sellers; top customers (LTV); orders-by-status |

### Catalog
| Feature | Route | Description |
|---|---|---|
| Products list | `/admin/products` | Thumbnail, brand, from-price, stock, active/hidden |
| Product create / edit | `/admin/products/new`, `/admin/products/[id]` | Name, slug, SKU base, brand, family, gender, concentration, description, story, notes, season, occasion, longevity, sillage, active, featured |
| Variants | Product editor | Size (ml), SKU, price, sale price, stock, sample flag; add/delete |
| Images | Product editor | Add by URL, delete, ordered by position; “View Live” to storefront |
| Delete product | Product editor | Danger zone |
| Brands | `/admin/brands` | CRUD: name, slug, country, logo URL, description (delete blocked if products exist) |
| Fragrance families | `/admin/families` | CRUD: name, slug, accent color, description |
| Collections | `/admin/collections` | CRUD: name, slug, subtitle, cover, description, featured-on-homepage |
| Inventory | `/admin/inventory` | All variants by stock; total units / low-stock / value; per-variant +/- adjuster (`inventory_logs`) |

### Orders
| Feature | Route | Description |
|---|---|---|
| Orders list | `/admin/orders` | Filter by status; order #, customer, date, status, Paperfly tracking, total |
| Order detail | `/admin/orders/[id]` | Line items, fees/discounts/gift wrap/loyalty, customer + address + gift message, tracking timeline |
| Push to Paperfly | Order detail | One-click shipment / AWB; retry count + notification on failure |
| Advance tracking | Order detail | Mock status: dispatched → in_transit → delivered |
| Manual status | Order detail | Set status (paid/refunded via payment/refund flows) |
| Internal notes | Order detail | Admin-only notes |
| Refund | Order detail | Restores stock, reverses loyalty, releases promo usage |

### Customers (CRM)
| Feature | Route | Description |
|---|---|---|
| Customers list | `/admin/customers` | Name, phone, order count, LTV, loyalty points, role, blocked badge |
| Customer detail | `/admin/customers/[id]` | LTV / orders / points; order history links |
| Loyalty adjust | Customer detail | ± points with reason |
| CRM notes | Customer detail | Internal notes |
| Grant / revoke admin | Customer detail | Cannot revoke self; at least one admin remains |
| Block / unblock | Customer detail | Flag customers |

### Marketing
| Feature | Route | Description |
|---|---|---|
| Promo codes | `/admin/promo-codes` | CRUD: code, type (percent / fixed / free_ship), value, min order, usage limit, expiry, active; used vs limit |
| Gift cards | `/admin/gift-cards` | Create code + amount; status active / disabled / depleted; delete |
| Reviews moderation | `/admin/reviews` | Approve / reject / delete; verified-purchase badge |
| Banners | `/admin/banners` | CRUD: title, subtitle, image, link, CTA, active |
| Newsletter | `/admin/newsletter` | Subscriber list; total count; **Export CSV** |
| Scent quiz editor | `/admin/quiz` | CRUD questions & options; family_weights + note_weights JSON |
| Journal | `/admin/journal` | CRUD: title, slug, author, cover, excerpt, body, published |

### System
| Feature | Route | Description |
|---|---|---|
| Settings | `/admin/settings` | Store name, contact, fees, loyalty/tax, low-stock threshold; payment & logistics mock↔live; shipping zones; content pages (`about`, `faq`, `shipping-returns`, `privacy`, `terms`) |
| Audit log | `/admin/audit` | Last 200 admin actions (actor, action, entity, time) |
| Notifications | `/admin/notifications` | Topbar bell; unread badge; new paid orders, Paperfly failures, contact messages; mark all read |
| Admin shell | `/admin/*` | Collapsible sidebar, theme toggle, “View Store”, welcome name |

---

## Getting Started

### 1. Install
```bash
npm install
```

### 2. Provision Supabase (project: **AuraEssense**)
Apply the SQL in order via the **Supabase MCP** (recommended) or the SQL editor / CLI:

1. `supabase/migrations/0001_schema.sql` — tables, enums, indexes, triggers, functions
2. `supabase/migrations/0002_rls.sql` — Row Level Security policies
3. `supabase/seed.sql` — real fragrances, brands, collections, quiz, promos, journal

> Using the Supabase MCP: ask the agent to apply each migration with `apply_migration`, then run the seed. Afterwards, `gen types` can replace `src/lib/supabase/types.ts` for stronger typing.

### 3. Environment
```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (server only — webhooks, order processing) |
| `PAYMENT_PROVIDER` | `mock` (default) or `live` |
| `LOGISTICS_PROVIDER` | `mock` (default) or `live` |

### 4. Configure Auth (Supabase Dashboard)
- Enable **Email** provider with **password** sign-in (email confirmation optional for local testing).
- Enable **Google** provider and add your Google OAuth Client ID + Secret.
- Auth URL configuration (Site URL + Redirect URLs):
  - **Site URL (production):** `https://auraessense.vercel.app`
  - Redirect allow list:
    - `http://localhost:3000/**` (local)
    - `https://auraessense.vercel.app/**` (production)
    - `https://*-abusayem.vercel.app/**` (Vercel previews)
- Google authorized redirect URI (Google Cloud Console):
  - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Sign-in: `/login` · Sign-up: `/signup` · Password reset: `/forgot-password`.

### 5. Run
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 6. Make yourself an admin
After signing in once:
```sql
update profiles set role = 'admin' where id = '<your-auth-user-id>';
```
Then open `/admin`.

---

## Integrations (mocked, swappable)

Payments and logistics sit behind interfaces so live credentials can drop in later without changing business logic:

- **Payments** — `src/lib/payments/payment-gateway.ts` (`MockSslCommerzeGateway` ↔ `SslCommerzeGateway`). Mock hosted page: `/checkout/mock-pay`. On success, IPN marks paid, decrements stock, awards loyalty.
- **Logistics** — `src/lib/logistics/logistics-provider.ts` (`MockPaperfly` ↔ `PaperflyProvider`). Mock AWB; webhook syncs delivery status.

Switch via `PAYMENT_PROVIDER=live` / `LOGISTICS_PROVIDER=live` or admin **Settings** toggles, then implement provider stubs with real API calls + credentials.

| Webhook | Purpose |
|---|---|
| `POST /api/webhooks/sslcommerz` | Payment IPN |
| `POST /api/webhooks/paperfly` | Delivery status |

---

## Images

Product imagery uses **royalty-free Unsplash placeholders** (not trademarked brand photos). Fragrance names and olfactory notes are real for authenticity; prices, stock, SKUs, reviews and customers are illustrative/dummy. A graceful on-brand fallback renders if any remote image fails. Add your own images per-product in admin (or upload to Supabase Storage and paste the URL).

---

## Deploy to Vercel

1. Push to GitHub and import the repo into Vercel.
2. Add the environment variables from `.env.local` to the Vercel project.
3. Set `NEXT_PUBLIC_SITE_URL` to your production domain.
4. Add the production `/auth/callback` URL to Supabase Auth redirect URLs.
5. Deploy.

---

## Project Structure

```
src/
  app/
    (storefront)/      # public storefront + account
    (auth)/            # login / signup / password
    admin/             # admin console
    api/               # search + webhooks
  components/          # UI, product, cart, admin, account, reviews…
  lib/
    supabase/          # browser/server/admin clients + middleware
    actions/           # server actions (account, checkout, admin/*)
    payments/          # PaymentGateway interface + mock/live
    logistics/         # LogisticsProvider interface + mock/live
    queries.ts, catalog.ts, orders.ts, settings.ts, pricing.ts
supabase/
  migrations/          # 0001_schema, 0002_rls
  seed.sql             # real fragrances + content
```

---

Built with care for the AuraEssence house.
