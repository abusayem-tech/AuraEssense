# AuraEssence — Luxury Perfume E-Commerce

A world-class, dark-luxury perfume e-commerce platform for the Bangladeshi market, built with **Next.js 16 (App Router)**, **Supabase** (PostgreSQL, Auth, Storage, RLS), **Tailwind CSS v4**, and deployable on **Vercel**.

It features a complete editorial storefront, a scent-profile quiz, multi-size variants & discovery samples, gifting, loyalty, reviews, a full operations **admin console**, and mocked **SSL Commerze** (payments) + **Paperfly** (logistics) integrations behind clean, swappable interfaces.

---

## Features

### Storefront
- **Cinematic home** with parallax hero, featured edit, collections, brand marquee, family explorer, journal, newsletter.
- **Catalog** with URL-synced multi-parameter filtering (brand, gender, concentration, family, season, occasion, **olfactory notes**, price), sorting, pagination, ⌘K command search.
- **Product pages** with image gallery + zoom, animated **olfactory pyramid**, longevity/sillage meters, **size/variant selector** (30/50/100ml + samples), back-in-stock alerts, verified reviews, "pairs well with" layering, related products, JSON-LD.
- **Scent Profile Quiz** with weighted matching that returns your top-3 in-stock fragrances.
- **Cart & checkout** — persistent slide-over cart, delivery zones (Dhaka/Outside), promo codes, gift cards, gift wrapping, loyalty redemption.
- **Account** — profile, address book, order history with **visual tracking timeline**, wishlist, loyalty rewards.
- **Auth** — email/password + Google OAuth (Supabase), HTTP-only cookie sessions.
- **Editorial** — Journal, collections, and editable content pages (About, FAQ, Shipping, Privacy, Terms).

### Admin Console (`/admin`, role-gated)
- **Dashboard** — revenue/orders KPIs with trends, revenue chart, fulfillment queue, low-stock & recent orders.
- **Sales & Analytics** — revenue over time, sales by brand/product/zone, AOV, repeat rate, LTV, best sellers, inventory valuation, date ranges.
- **Catalog** — products + variants + images CRUD, brands, families, collections, inventory adjustments.
- **Orders** — status pipeline, order events, refunds (with stock restore), internal notes, **one-click Push-to-Paperfly** with retry/queue.
- **Customers (CRM)** — LTV, loyalty adjustments, roles (RBAC), block/flag, notes.
- **Marketing** — promo codes, gift cards, banners, reviews moderation, quiz editor, newsletter export.
- **Content** — journal editor, editable static pages.
- **System** — store settings, shipping zones/fees, **provider toggles (mock↔live)**, audit log, notifications.

---

## Tech Stack
- Next.js 16 (App Router, RSC, Server Actions) + TypeScript
- Supabase (PostgreSQL + RLS, Auth, Storage)
- Tailwind CSS v4, Radix UI primitives, Framer Motion, Recharts, Lucide
- Zustand (cart), nuqs (URL filter state), Zod (validation)

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
Copy `.env.example` to `.env.local` and fill in your Supabase keys:
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
  - Redirect allow list should include:
    - `http://localhost:3000/**` (local)
    - `https://auraessense.vercel.app/**` (production)
    - `https://*-abusayem.vercel.app/**` (Vercel previews)
- Google authorized redirect URI (in Google Cloud Console):
  - `https://YOUR_PROJECT_REF.supabase.co/auth/v1/callback`

Sign-in lives at `/login`, sign-up at `/signup`, password reset at `/forgot-password`.

### 5. Run
```bash
npm run dev
```
Visit `http://localhost:3000`.

### 6. Make yourself an admin
After signing in once, set your profile role to `admin`:
```sql
update profiles set role = 'admin' where id = '<your-auth-user-id>';
```
Then open `/admin`.

---

## Integrations (mocked, swappable)

Payments and logistics are abstracted behind interfaces so real credentials can be dropped in later **without touching business logic**:

- **Payments** — `src/lib/payments/payment-gateway.ts` (`MockSslCommerzeGateway` ↔ `SslCommerzeGateway`). The mock renders a hosted "payment page" at `/checkout/mock-pay`; on success the IPN logic marks the order paid, decrements stock, and awards loyalty.
- **Logistics** — `src/lib/logistics/logistics-provider.ts` (`MockPaperfly` ↔ `PaperflyProvider`). The mock generates an AWB tracking number; the webhook (`/api/webhooks/paperfly`) syncs delivery status.

Switch to live by setting `PAYMENT_PROVIDER=live` / `LOGISTICS_PROVIDER=live` (or the admin **Settings** toggles) and implementing the provider stubs with real API calls + credentials.

Webhooks:
- `POST /api/webhooks/sslcommerz` — payment IPN
- `POST /api/webhooks/paperfly` — delivery status

---

## Images
Product imagery uses **royalty-free Unsplash placeholders** (not trademarked brand photos). Fragrance names and olfactory notes are real for authenticity; prices, stock, SKUs, reviews and customers are illustrative/dummy. A graceful on-brand fallback renders if any remote image fails. To use your own images, add them per-product in the admin (or upload to a Supabase Storage bucket and paste the URL).

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
    (auth)/            # login
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

Built with care for the AuraEssence house. Prices in BDT (৳).
