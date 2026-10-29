# MRITTIKA — Project Context & Information

> Complete reference document for the Mrittika D2C e-commerce platform.
> Last updated: 2026-10-04

---

## 1. PROJECT OVERVIEW

**Mrittika** is a direct-to-consumer (D2C) skincare brand from India selling handmade face packs. The repository contains the full production platform: customer storefront, admin dashboard, backend API, database schema, brand assets, and a reusable "universal context" blueprint for generating new client stores from the same architecture.

### Products (seeded in DB)

| Product | Slug | Price (₹) |
|---|---|---|
| Ubtan Mix Face Pack | `ubtan-mix-face-pack` | 139 |
| Soft Glow Face Pack | `soft-glow-face-pack` | 129 |
| Oil Control Face Pack | `oil-control-face-pack` | 119 |

- Currency: INR (₹), integer prices in paise-agnostic rupees
- Payment: Razorpay (Prepaid) + Cash on Delivery
- Shipping: Shiprocket (AWB tracking, pickup, cancellation, refunds)
- Email: Resend (transactional)
- Default coupon: `SUM10` (10% percentage discount)

---

## 2. REPOSITORY STRUCTURE

```
E:\Mrittika-main\
├── Mrittika-main/                  # Main application monorepo
│   ├── web/                        # CUSTOMER STOREFRONT (Next.js 16.2.6, App Router)
│   ├── server/                     # EXPRESS API (Express 5, Node, deployed to Render)
│   ├── mritikaa/                   # Brand assets: hero videos, founder video,
│   │                               #   testimonial video, frames/, frames_for_mobile/
│   └── Product/                    # Product photography (front/back/shoot per product)
├── mrittika-dashboard/             # STANDALONE ADMIN DASHBOARD (Next.js 16.2.9)
├── supabase-sql/                   # Database schema
│   ├── 00_full_schema.sql          #   Full fresh-project schema (run once)
│   └── migrations/                 #   Incremental migrations (10 files)
├── universal-context/              # Reusable D2C platform blueprint (5 docs)
│   ├── 01-instructions.md          #   AI generation workflow + client brief template
│   ├── 02-architecture.md          #   Repo structure, tech stack, design system
│   ├── 03-data-schema.md           #   Generic SQL schema + TS types
│   ├── 04-ecommerce-flow.md        #   Order lifecycle, payments, shipping, coupons
│   └── 05-dashboard-and-patterns.md#   Dashboard features + implementation patterns
├── render.yaml                     # Render deployment config for the Express API
└── .gitignore
```

---

## 3. TECH STACK

| Layer | Technology |
|---|---|
| Storefront | Next.js **16.2.6** (App Router) + React 19.2.4 |
| Dashboard | Next.js **16.2.9** (App Router) + React 19.2.4 |
| Styling | Tailwind CSS v4 + CSS Modules (`*.module.css`) |
| UI Components | shadcn/ui (`components/ui/`), Base UI, Lucide icons |
| Charts | Recharts 3 |
| Backend API | Express 5 (ESM), helmet, morgan, cors |
| Auth (Express) | JWT verified via JWKS-RSA (`jsonwebtoken` + `jwks-rsa`) |
| Database | Supabase (managed PostgreSQL) + RLS + Realtime |
| Payments | Razorpay (`razorpay` SDK, HMAC-SHA256 verification) |
| Shipping | Shiprocket (token auth, AWB, pickup, webhooks) |
| Email | Resend |
| Validation | Zod 4 on all API inputs |
| Forms | React Hook Form + @hookform/resolvers |
| Dates | date-fns |
| Toasts | sonner |
| Language | TypeScript 5 (web + dashboard), plain JS ESM (server) |
| Image processing | sharp (web) |
| Analytics | Vercel Analytics (web) |

### Important: Next.js 16 caveat

Both `web/AGENTS.md` and `mrittika-dashboard/AGENTS.md` warn: **this is not the Next.js you know** — v16 has breaking changes in APIs, conventions, and file structure. Consult `node_modules/next/dist/docs/` before writing any code.

---

## 4. STOREFRONT — `Mrittika-main/web/`

### Route groups (`src/app/`)

- `(shop)/` — public storefront wrapped by Navbar + Footer + CartProvider
  - `/` homepage (video-frame hero, featured products, value props, testimonials, founder section)
  - `/shop`, `/product/[slug]`, `/cart`, `/checkout`, `/order-success`
  - `/orders` (email lookup), `/track` (AWB tracking), `/wishlist`
  - `/about`, `/contact`, `/policies/[slug]`
- `(dashboard)/` — embedded admin (auth/login + dashboard pages)
- `api/` — Next.js API routes (payment create/verify/cod/webhook, coupons, contact, reviews, orders + cancel, shipping track/webhook, admin resync)
- `robots.ts`, `sitemap.ts`, `not-found.tsx`

### Key source layout

```
src/
├── components/        # 47 entries: Navbar, Footer, HeroFramePlayer, HeroStory,
│                      # ProductCard/Grid/Gallery/CTA, ReviewSection, RazorpayCheckout,
│                      # CheckoutForm, PaymentModal, DeliveryTracker, TruckAnimation,
│                      # WishlistButton, SearchOverlay, FloatingLeaves (brand animation),
│                      # FounderVideo, VideoTestimonial, TrustStrip, AboutTimeline,
│                      # ScrollRevealProvider, charts/, dashboard/, ui/
│                      # (each paired with a *.module.css)
├── context/           # CartContext (localStorage-persisted cart + coupon)
├── data/              # Static/fallback product data
├── hooks/             # useDeviceType, useScrollReveal, useFramePreloader
├── lib/
│   ├── supabaseClient.ts / supabase/   # browser, server, admin (service role) clients
│   ├── razorpay.ts       # order create, signature verify, refund
│   ├── shiprocket.ts     # token cache, create order, assign AWB, pickup, track, cancel
│   ├── orderStore.ts     # order CRUD against Supabase
│   ├── orders.ts, notifications.ts (Resend emails), reviews.ts,
│   ├── wishlist.ts       # localStorage + 'wishlist-updated' custom events
│   ├── shopProducts.ts, heroFrameConfig.ts, types.ts, utils.ts
├── types/, utils/
middleware.ts          # auth guard for dashboard routes
```

### Env vars (`web/.env.example`)

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
NEXT_PUBLIC_RAZORPAY_KEY_ID=
```
Plus server-side only: `SUPABASE_SERVICE_ROLE_KEY`, `RAZORPAY_KEY_SECRET`, Shiprocket email/password, `RESEND_API_KEY`, `STORE_EMAIL`.

---

## 5. EXPRESS API — `Mrittika-main/server/`

```
src/
├── index.js            # app bootstrap (helmet, cors, morgan, routes)
├── config.js           # env config
├── supabaseClient.js   # service-role client
├── middleware/auth.js  # JWT (JWKS-RSA) + admin RBAC via profiles.is_admin
└── routes/
    ├── health.js       # GET /health (Render health check)
    ├── products.js
    ├── orders.js
    ├── payments.js     # Razorpay order create / verify / refund
    ├── newsletter.js
    └── admin.js
```

- ESM (`"type": "module"`), entry `src/index.js`
- Scripts: `npm run dev` (`node --watch`), `npm start`
- Env vars (`.env.example`): `PORT=4000`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE=authenticated`, `CORS_ORIGIN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`

---

## 6. ADMIN DASHBOARD — `mrittika-dashboard/`

Standalone Next.js 16 app (separate from the embedded `(dashboard)` group in web).

### Pages (`app/dashboard/`)

overview · orders · products · inventory · coupons · customers · analytics · leads · blog · seo · settings · reviews — plus `app/auth/login`.

### Auth model (`middleware.ts`)

Cookie-based: `mrittika_session === "authenticated"`. Unauthenticated `/dashboard/*` → redirect `/auth/login`; authenticated `/auth/*` → redirect `/dashboard/overview`. Matcher: `/dashboard/:path*`, `/auth/:path*`.

### Structure

- `components/ui/` (shadcn), `components/dashboard/` (Sidebar, Header, DataTable, StatCard, StatusBadge, etc.), `components/charts/` (Recharts)
- `lib/supabase/` (SSR + admin clients), `lib/utils.ts` (`cn()`)
- Supabase Realtime used for live order/lead notifications

### Overview page features

KPI cards (today/monthly revenue, total/pending orders, low/out-of-stock, leads, customers, AOV), recent orders table, business alerts panel, 30-day revenue chart.

---

## 7. DATABASE — Supabase (PostgreSQL)

Authoritative schema: `supabase-sql/00_full_schema.sql` (342 lines). Migrations in `supabase-sql/migrations/` (initial schema, coupon redemptions, orders rebuild, reviews, shiprocket sync status, coupons, missing columns, server schema).

### Tables

| Table | Purpose |
|---|---|
| `profiles` | Extends auth.users; `role` (default 'owner'), `is_admin` |
| `products` | name, slug, price/compare_price (INTEGER ₹), category, sku, stock/stock_quantity, weight, status, featured, images[], badge |
| `product_images` | Per-product image gallery (is_primary, sort_order) |
| `orders` | TEXT PK, razorpay_order_id/payment_id, payment_method (Prepaid/COD), status, totals breakdown, customer + shipping address, shiprocket_* fields, awb_number, cancellation JSONB, refund_* fields |
| `order_items` | FK to orders + products, quantity, unit/total price, image_url |
| `reviews` | product_slug, name, rating 1–5, comment, verified |
| `coupons` | code, discount_type (percentage/fixed), value, min_order_value, max_uses, per-user limits, expiry |
| `coupon_redemptions` | coupon_id, user_email, order_id |
| `newsletter_subscribers` | Unique emails |
| `leads` | source (contact_form/whatsapp/instagram/manual), status (New/Contacted/Converted/Closed) |
| `stock_movements` | Inventory audit trail |
| `blog_posts` | CMS with SEO fields, draft/published |
| `seo_pages` | Per-page SEO + Open Graph config |

### Notable details

- RLS enabled on every table; products/reviews/order-items publicly readable; orders publicly insertable; admin tables gated on `auth.role() = 'authenticated'`; service role bypass policies.
- Trigger `on_auth_user_created` auto-creates profile on signup.
- RPC: `increment_coupon_usage(coupon_code)`.
- Realtime publication: `orders`, `leads`, `coupon_redemptions`.
- Indexes on order lookups (email, status, created_at, razorpay ids), product slug, reviews, coupon redemption uniqueness check.

### Order lifecycle / statuses

`Order Confirmed → Processing → Shipped → Out for Delivery → Delivered` (+ `Cancelled`, RTO states). Order ID format: `{PREFIX}-{timestamp}` prepaid, `{PREFIX}-COD-{timestamp}` COD.

---

## 8. E-COMMERCE FLOWS

1. **Browse → Cart** — CartContext persists to localStorage; coupon validated via API (active/expiry/usage/per-user/min-order chain).
2. **Checkout** — 3 steps: shipping address → payment method (Razorpay or COD) → confirm & pay.
3. **Online payment** — create Razorpay order → checkout modal → verify HMAC-SHA256 signature → save order → create Shiprocket order + AWB + pickup → send emails (customer + store) → increment coupon usage → clear cart → `/order-success`.
4. **COD** — same flow without payment verification.
5. **Post-order** — email-based order lookup, AWB tracking page, cancellation within window (cancel on Shiprocket + Razorpay refund for prepaid).
6. **Shipping failures are non-blocking** — order always saved; `shiprocket_sync_status` tracks failures for admin re-sync (`/api/admin/resync-shipping`).

---

## 9. DEPLOYMENT

| Component | Platform | Notes |
|---|---|---|
| Storefront (`web/`) | Vercel | `vercel.json` present; Vercel Analytics |
| Express API (`server/`) | Render | `render.yaml`: node 22, free plan, `npm ci` / `npm start`, health check `/health` |
| Admin dashboard | Vercel | Standalone app |
| Database + Storage | Supabase | Managed Postgres + Storage for media |

`render.yaml` env vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_JWT_ISSUER`, `SUPABASE_JWT_AUDIENCE=authenticated`, `CORS_ORIGIN`, `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` (all unsynced secrets).

---

## 10. UNIVERSAL CONTEXT BLUEPRINT (`universal-context/`)

A client-agnostic architectural template for spinning up new D2C stores on the same stack. Contains:

- **01-instructions.md** — workflow + a full YAML client brief template (brand, products, business rules, design tokens, tech choices)
- **02-architecture.md** — canonical repo structure, tech stack table, design-token layers, typography/animation system, breakpoints
- **03-data-schema.md** — generic SQL schema + TypeScript interfaces
- **04-ecommerce-flow.md** — order lifecycle, cancellation, shipping adapter matrix (Shiprocket/ShipStation/Delhivery), payment adapters (Razorpay/Stripe), coupon system, email system, API endpoint table, security measures
- **05-dashboard-and-patterns.md** — dashboard page specs, Supabase client patterns, cart/wishlist patterns, env var templates, deployment matrix

Mrittika (`Mrittika-main/`) is the first concrete implementation generated from this blueprint.

---

## 11. BRAND ASSETS

- `Mrittika-main/mritikaa/` — hero frame sequences (`frames/`, `frames_for_mobile/`), founder video (`Founder video.webm`), testimonial video, PC/Mobile hero videos (`PC .webm`, `Mobile.webm`), value-prop images (Wild-Harvested Botanicals, Made in Small Batches, Formulated for Indian Skin), icons, contact page image
- `Mrittika-main/Product/` — front/back packaging + shoot photos for all 3 face packs (webp)
- Brand personality: earthy, natural, small-batch Indian skincare; decorative animation = floating leaves (`FloatingLeaves.tsx`)

---

## 12. SECURITY POSTURE

- Supabase RLS on all tables; service-role key server-side only
- Razorpay HMAC-SHA256 signature verification; webhook signature checks
- Zod validation on all API inputs; 1MB body limit
- helmet + CORS whitelist (Express); JWT via JWKS-RSA; admin RBAC (`profiles.is_admin`)
- Cancellation window + order status transition enforcement
- `.gitignore` excludes all `.env*`, `node_modules/`, builds, IDE files
- Never commit secrets; env values marked `sync: false` in render.yaml

---

## 13. LOCAL DEVELOPMENT

```powershell
# Storefront
cd Mrittika-main\web; npm install; npm run dev        # http://localhost:3000

# Express API
cd Mrittika-main\server; npm install; npm run dev     # http://localhost:4000

# Admin dashboard
cd mrittika-dashboard; npm install; npm run dev       # http://localhost:3001
```

Lint: `npm run lint` (eslint) in `web/` and `mrittika-dashboard/`.
Database: run `supabase-sql/00_full_schema.sql` on a fresh Supabase project, then apply `supabase-sql/migrations/` in order.

---

## 14. KEY CONVENTIONS

- No code comments unless requested
- Prices stored as INTEGER rupees
- localStorage keys namespaced by brand (cart, coupon, wishlist, customer email)
- Route groups: `(shop)` public, `(dashboard)` auth-guarded
- CSS: design tokens as CSS variables in `globals.css`; scoped styles via CSS Modules
- Dashboard cookie: `mrittika_session`
- TypeScript everywhere except the Express server (plain ESM JS)