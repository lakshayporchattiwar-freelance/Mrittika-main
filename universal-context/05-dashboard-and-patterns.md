# DASHBOARD FEATURES — Universal D2C Platform

## Overview Page
- Greeting with time-of-day (Good morning/afternoon/evening, {Founder})
- KPI metric cards:
  - Today's Revenue
  - Monthly Revenue
  - Total Orders
  - Pending Orders (amber border highlight)
  - Low Stock Products (red border highlight)
  - Out of Stock Products (red border highlight)
  - New Leads
  - Total Customers
  - Avg Order Value
- Recent Orders table (last 10) with status badges
- Business Alerts panel:
  - Pending orders alert
  - Low stock warning
  - Out of stock critical
  - New leads needing response
  - No orders today (info)
  - Today's revenue summary
  - Cancelled orders this month
  - Expiring coupons (within 7 days)
- Revenue chart (last 30 days, Recharts bar chart)

## Orders Management
- Search: by order ID, customer name, email
- Filters: status, payment method, date range (from/to)
- Summary badges: Today's total, Pending count
- Desktop: Full table with columns (Order ID, Customer, Items, Amount, Payment, Status, Date, Actions)
- Mobile: Card layout
- Actions dropdown per order: View Details, Update Status, View Refund Status
- Order detail slide-out (Sheet):
  - Delivery timeline (visual progress: Order Placed → Confirmed → Processing → Shipped → Delivered)
  - Tracking number (AWB) display with copy
  - Customer info (name, email, phone)
  - Shipping address
  - Items list with images
  - Payment details (method, total, coupon, payment ID)
  - Refund status card (if cancelled)
- Status update dialog:
  - Select new status from dropdown
  - If "Shipped" and no AWB → AWB input field
  - Confirm button

## Products Management
- Grid view of product cards (image, name, category, price, compare price, stock, status)
- Filters: search, category, status
- Add Product (Sheet form):
  - Name (auto-generates slug)
  - Slug (editable if editing)
  - Category dropdown (from {PRODUCT_CATEGORIES})
  - Description (textarea)
  - Price + Compare Price (side by side)
  - SKU + Stock Quantity (side by side)
  - Status: Active / Draft / Out of Stock
  - Featured toggle
  - Images: URL array with add/remove
- Edit Product (same form, pre-filled)
- Delete Product (confirmation dialog)
- Stock color coding: red (<5), amber (5-19), green (20+)

## Inventory Management
- Stock level overview with Recharts bar chart
- Low stock / out of stock alert cards
- Stock update dialog: adjust quantity + reason/note
- Stock movement history table (product, previous qty, new qty, change, note, date)
- Quick restock actions

## Coupons Management
- Coupon list with columns (code, type, value, usage, status, expiry)
- Add/Edit Coupon (Sheet form):
  - Code, Description
  - Discount type: percentage / fixed
  - Discount value
  - Min order value
  - Max uses, Max uses per user
  - Expiry date
  - Active toggle
- Redemption tracking per coupon (Sheet):
  - List of redemptions: user email, order ID, date
  - Total redemptions count
- Expiry warnings
- Quick toggle active/inactive

## Customers Management
- Customer list aggregated from orders (unique emails)
- Metrics per customer:
  - Order count, Paid amount, Cancelled amount, Refunded amount
  - Lifetime value, Avg order value
  - First order date, Last order date
- Filters: status (Active, At-Risk, New, VIP)
- Customer detail slide-out with order history

## Analytics Page
- Revenue over time (line/area chart)
- Orders by status (pie/donut chart)
- Top products by revenue
- Customer acquisition trend
- Payment method distribution
- Coupon usage stats

## Blog Management
- Blog post list with status badges (Draft/Published)
- Add/Edit Post (Sheet form):
  - Title (auto-generates slug)
  - Category, Tags
  - Excerpt, Content (rich text)
  - Featured image URL
  - SEO title + description
  - Status: Draft / Published
- Delete confirmation

## SEO Management
- Per-page SEO configuration
- Fields: page path, page name, SEO title, SEO description
- Open Graph: og_image, og_title, og_description
- Last updated timestamp

## Leads Management
- Contact form submissions list
- Status tracking: New → Contacted → Qualified → Lost
- Notes field for follow-up
- Source tracking

## Settings
- Store name, contact info, social links
- Shipping configuration
- Email configuration
- Analytics IDs

---

# IMPLEMENTATION PATTERNS

## Supabase Client Pattern
```typescript
// Browser client (anon key, respects RLS)
import { createBrowserClient } from "@supabase/ssr"

// Server component (cookie-based SSR)
import { createServerClient } from "@supabase/ssr"

// Admin/API routes (service role key, bypasses RLS)
import { createClient } from "@supabase/supabase-js"
// → createClient(url, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } })
```

## Cart State Pattern
```typescript
// React Context + localStorage persistence
// CartContext provides: items, addItem, removeItem, updateQty, clearCart, total, count, mounted
// Coupon state: appliedCoupon, setAppliedCoupon (also persisted)
// mounted state prevents hydration mismatch
// Cart + coupon cleared on successful order
// localStorage keys: {brand}_cart, {brand}_coupon
```

## Wishlist Pattern
```typescript
// Pure localStorage + custom events (no context needed)
// Functions: getWishlist(), addToWishlist(slug), removeFromWishlist(slug), isInWishlist(slug), getWishlistCount()
// Event: 'wishlist-updated' dispatched on add/remove
// Components listen for event to re-render
// localStorage key: {brand}_wishlist
```

## Order ID Format
```
Prepaid: {ORDER_PREFIX}-{timestamp}
COD:    {ORDER_PREFIX}-COD-{timestamp}
```

## Route Groups
```
(shop)     → Public storefront: Navbar + Footer + CartProvider
(dashboard) → Admin: Sidebar + Header + Auth guard middleware
```

## CSS Architecture
```
globals.css    → Design tokens (CSS variables), Tailwind v4 theme, base styles
*.module.css   → Page/component-specific styles (scoped)
shadcn/ui      → Tailwind utility classes
```

---

# ENVIRONMENT VARIABLES

## Web App (.env)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_{PAYMENT_GATEWAY}_KEY_ID=

# Server-side only
SUPABASE_SERVICE_ROLE_KEY=
{PAYMENT_GATEWAY}_KEY_SECRET=
{SHIPPING_PARTNER}_EMAIL=          # If Shiprocket
{SHIPPING_PARTNER}_PASSWORD=       # If Shiprocket
{SHIPPING_PARTNER}_API_KEY=       # If ShipStation/Delhivery
{SHIPPING_PARTNER}_API_SECRET=    # If ShipStation
RESEND_API_KEY=
STORE_EMAIL=
```

## Express Server (.env)
```
PORT=4000
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_ANON_KEY=
SUPABASE_JWT_ISSUER=
SUPABASE_JWT_AUDIENCE=authenticated
CORS_ORIGIN=http://localhost:3000
{PAYMENT_GATEWAY}_KEY_ID=
{PAYMENT_GATEWAY}_KEY_SECRET=
```

---

# DEPLOYMENT

| Component | Platform |
|-----------|----------|
| Web Storefront | Vercel (Next.js App Router) |
| Admin Dashboard | Vercel (separate app OR embedded) |
| Express API | Railway / Render / any Node host |
| Database | Supabase (managed PostgreSQL) |
| Media Storage | Supabase Storage + /public static assets |
| Domain | Custom domain via Vercel |
| Analytics | Vercel Analytics + GA4 + GTM |
| CI/CD | Vercel Git integration (auto-deploy on push) |

---

# AI GENERATION OUTPUT SPEC

When generating documents for a client, the AI must:

1. **PRD**: Include client-specific user stories, market positioning, feature priorities (P0/P1/P2), success metrics
2. **TRD**: Specify exact API contracts, integration details for THEIR payment/shipping/email providers, env vars
3. **App Flow**: Map every user journey for THEIR product types, THEIR checkout steps, THEIR cancellation policy
4. **Design.md**: Generate concrete CSS variables with THEIR colors, select appropriate fonts, define THEIR animation style, specify component variants matching THEIR brand personality
5. **Data Schema**: SQL with THEIR categories, THEIR HSN codes, THEIR currency, appropriate indexes for THEIR query patterns
6. **Security**: Address THEIR geography's data laws (India DPDP, GDPR, etc.), THEIR payment provider's security requirements
7. **Implementation Plan**: Phase-by-phase with exact files to create, estimated hours, dependencies — customized for THEIR scope
