# ARCHITECTURE — Universal D2C E-Commerce Platform

## 1. REPO STRUCTURE

```
{BRAND_NAME}/
├── web/                              # Next.js (App Router) — Customer Storefront + API
│   ├── src/
│   │   ├── app/
│   │   │   ├── (shop)/               # PUBLIC STOREFRONT (route group)
│   │   │   │   ├── page.tsx          # Homepage (hero, featured products, value props, testimonials)
│   │   │   │   ├── layout.tsx        # Navbar + Footer + CartProvider wrapper
│   │   │   │   ├── shop/             # All products listing page
│   │   │   │   ├── product/[slug]/   # Product detail (gallery, info, reviews, add-to-cart)
│   │   │   │   ├── cart/             # Cart with coupon validation + shipping calc
│   │   │   │   ├── checkout/         # Multi-step: Shipping → Payment → Confirm
│   │   │   │   ├── order-success/    # Post-payment success page
│   │   │   │   ├── orders/           # Order lookup (by email) + list + cancel
│   │   │   │   ├── track/            # Real-time order tracking (AWB-based)
│   │   │   │   ├── wishlist/         # Saved products
│   │   │   │   ├── about/           # Brand story, timeline, founder
│   │   │   │   ├── contact/         # Contact form → email
│   │   │   │   └── policies/[slug]/ # Privacy, Terms, Refund, Shipping
│   │   │   │
│   │   │   ├── (dashboard)/          # ADMIN DASHBOARD (route group, auth-guarded)
│   │   │   │   ├── auth/login/       # Admin login
│   │   │   │   └── dashboard/        # All admin pages
│   │   │   │
│   │   │   ├── api/                  # NEXT.JS API ROUTES (core business logic)
│   │   │   │   ├── payment/
│   │   │   │   │   ├── create-order/   # Create payment gateway order
│   │   │   │   │   ├── verify/         # Verify payment + save order + shipping + email
│   │   │   │   │   ├── cod-order/      # Cash on delivery order flow
│   │   │   │   │   └── webhook/        # Payment gateway webhook
│   │   │   │   ├── coupons/validate/    # Coupon validation
│   │   │   │   ├── contact/             # Contact form → email
│   │   │   │   ├── reviews/             # Product reviews CRUD
│   │   │   │   ├── orders/              # Order lookup by email
│   │   │   │   ├── orders/[id]/         # Single order
│   │   │   │   ├── orders/[id]/cancel/  # Cancel + refund + shipping cancel
│   │   │   │   ├── shipping/track/     # AWB tracking via shipping partner
│   │   │   │   ├── shipping/webhook/   # Shipping partner status updates
│   │   │   │   └── admin/resync-shipping/ # Re-sync failed shipping orders
│   │   │   │
│   │   │   ├── layout.tsx            # Root layout (fonts, analytics, meta)
│   │   │   ├── globals.css           # Design tokens, CSS vars, Tailwind
│   │   │   ├── robots.ts             # SEO
│   │   │   ├── sitemap.ts            # Auto sitemap
│   │   │   └── not-found.tsx         # 404
│   │   │
│   │   ├── components/
│   │   │   ├── Navbar.tsx              # Sticky nav: search, account, wishlist, cart
│   │   │   ├── Footer.tsx              # Newsletter signup + links + contact
│   │   │   ├── Hero{Style}.tsx        # Hero section (video/image/carousel variant)
│   │   │   ├── ProductGrid.tsx        # Product listing grid
│   │   │   ├── ProductCard.tsx        # Product card with rating
│   │   │   ├── ProductCardSkeleton.tsx
│   │   │   ├── ProductGallery.tsx     # Product detail image gallery
│   │   │   ├── ProductCTA.tsx         # Add to cart section
│   │   │   ├── ReviewSection.tsx      # Reviews display + submit form
│   │   │   ├── LiveProductRating.tsx  # Real-time rating from DB
│   │   │   ├── {PaymentGateway}Checkout.tsx  # Payment flow component
│   │   │   ├── OrderButton.tsx        # Animated order button
│   │   │   ├── DeliveryTracker.tsx    # Visual delivery progress
│   │   │   ├── WishlistButton.tsx     # Heart toggle
│   │   │   ├── VideoTestimonial.tsx   # Video testimonial
│   │   │   ├── FounderVideo.tsx       # Founder story
│   │   │   ├── TrustStrip.tsx         # Trust badges
│   │   │   ├── AboutTimeline.tsx      # Brand timeline
│   │   │   ├── ScrollRevealProvider.tsx
│   │   │   ├── SearchOverlay.tsx      # Full-screen search
│   │   │   ├── CheckoutForm.tsx        # Checkout form
│   │   │   ├── PaymentModal.tsx       # Payment modal
│   │   │   ├── DecorativeAnimation.tsx # Brand-specific decorative animation
│   │   │   ├── charts/
│   │   │   │   └── RevenueChart.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   ├── StatCard.tsx
│   │   │   │   ├── StatusBadge.tsx
│   │   │   │   ├── PageHeader.tsx
│   │   │   │   └── RealtimeNotifications.tsx
│   │   │   └── ui/                    # shadcn/ui primitives
│   │   │
│   │   ├── context/
│   │   │   └── CartContext.tsx         # Cart state (localStorage persisted)
│   │   ├── data/
│   │   │   └── products.ts            # Static/fallback product data
│   │   ├── hooks/
│   │   │   ├── useDeviceType.ts
│   │   │   ├── useScrollReveal.ts
│   │   │   └── useFramePreloader.ts    # If video hero
│   │   ├── lib/
│   │   │   ├── supabaseClient.ts       # Supabase client + admin
│   │   │   ├── supabase/server.ts      # SSR client
│   │   │   ├── supabase/client.ts      # Browser client
│   │   │   ├── orderStore.ts          # Order CRUD operations
│   │   │   ├── orders.ts              # Order utilities
│   │   │   ├── shipping.ts            # Shipping partner integration
│   │   │   ├── payment.ts             # Payment gateway helpers
│   │   │   ├── notifications.ts       # Email notifications
│   │   │   ├── reviews.ts             # Reviews CRUD
│   │   │   ├── wishlist.ts            # Wishlist (localStorage + events)
│   │   │   ├── types.ts               # Shared types
│   │   │   └── utils.ts               # cn() etc.
│   │   ├── types/index.ts
│   │   └── utils/supabase/
│   │       ├── admin.ts
│   │       ├── server.ts
│   │       └── client.ts
│   │
│   ├── middleware.ts                   # Auth guard for dashboard routes
│   ├── next.config.ts
│   ├── vercel.json
│   └── package.json
│
├── dashboard/                         # STANDALONE ADMIN DASHBOARD (optional, can be embedded)
│   ├── app/
│   │   ├── auth/login/ + logout/
│   │   └── dashboard/
│   │       ├── overview/              # KPIs, charts, alerts
│   │       ├── orders/               # Order management
│   │       ├── products/             # Product CRUD
│   │       ├── inventory/            # Stock management
│   │       ├── coupons/              # Coupon management
│   │       ├── customers/            # Customer list + LTV
│   │       ├── analytics/            # Charts + insights
│   │       ├── leads/                # Contact submissions
│   │       ├── blog/                 # Blog CMS
│   │       ├── seo/                  # Per-page SEO config
│   │       └── settings/             # Store config
│   ├── components/, types/, utils/, lib/
│   └── middleware.ts
│
└── server/                            # EXPRESS API (optional alternative to Next.js API Routes)
    └── src/
        ├── index.js, config.js, supabaseClient.js
        ├── middleware/auth.js          # JWT auth + admin RBAC
        └── routes/ (health, products, orders, payments, newsletter, admin)
```

## 2. TECH STACK

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Frontend | Next.js (App Router) + React 19 | SSG/SSR storefront |
| Styling | Tailwind CSS v4 + CSS Modules | Utility + scoped styles |
| Components | shadcn/ui | Headless UI primitives |
| Charts | Recharts 3 | Dashboard analytics |
| Backend (Primary) | Next.js API Routes | Serverless API |
| Backend (Alt) | Express.js | Standalone API server |
| Database | Supabase (PostgreSQL) | Data + auth + storage |
| Auth | Supabase Auth + JWT | User auth + admin RBAC |
| Payments | {PAYMENT_GATEWAY} | Online payments |
| Shipping | {SHIPPING_PARTNER} | Fulfillment + tracking |
| Email | Resend | Transactional emails |
| Validation | Zod | Schema validation |
| Forms | React Hook Form | Form management |
| Analytics | Vercel Analytics + GA4 + GTM | Web analytics |
| Deployment | Vercel | Hosting + edge |
| Language | TypeScript | Type safety |
| Icons | Lucide React | Icon library |
| Dates | date-fns | Date utilities |

## 3. DESIGN SYSTEM ARCHITECTURE

The AI must generate concrete design tokens based on the Client Brief. The system uses:

### Token Layers
1. **Brand Tokens** — `--color-brand-*` (primary, secondary, accent, background, dark, muted, border)
2. **Semantic Tokens** — `--background`, `--foreground`, `--primary`, `--secondary`, `--muted`, `--destructive`, etc.
3. **Sidebar Tokens** — `--sidebar-*` for dashboard sidebar theming
4. **Radius Scale** — `--radius-sm` through `--radius-4xl`
5. **Chart Colors** — `--chart-1` through `--chart-5`

### Typography System
- **Display/Heading Font**: Set by `{HEADING_FONT}` — elegant serif for premium, clean sans for modern
- **Body Font**: Set by `{BODY_FONT}` — readable, clean
- **Accent Font** (optional): Handwritten/script for signatures, personal touches
- Scale: text-xs through text-5xl+ with responsive adjustments

### Animation Library
- Scroll reveal (Intersection Observer)
- Page entrance animation
- Button morphing on action
- Delivery tracking visualization
- Glass-morphism navbar on scroll
- Hero animation (video frames / parallax / carousel based on HERO_STYLE)
- Brand-specific decorative animation (floating elements matching the brand's world)

### Responsive Breakpoints
- Mobile: < 640px
- Tablet: 640-1024px
- Desktop: 1024px+
- Dashboard sidebar: collapsible on mobile
