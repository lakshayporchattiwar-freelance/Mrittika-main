# E-COMMERCE FLOW — Universal D2C Platform

## 1. COMPLETE ORDER LIFECYCLE

```
BROWSE → PRODUCT DETAIL → ADD TO CART → CART → CHECKOUT → PAYMENT → CONFIRMATION → TRACKING
```

### Step-by-step Flow:

**1. Product Discovery**
- Customer lands on Homepage → sees hero, featured products, value propositions, testimonials
- Navigates to /shop → filtered product grid
- Or searches via SearchOverlay
- Clicks product → /product/[slug] detail page (gallery, description, ingredients/materials, reviews, add-to-cart)

**2. Cart Management**
- Add to cart → CartContext updates → localStorage persists across sessions
- /cart page: item list, quantity controls, remove, coupon input, shipping calculation
- Coupon validation: POST /api/coupons/validate → checks active/expired/usage/per-user/min-order
- Shipping: free above {FREE_SHIPPING_THRESHOLD}, else {SHIPPING_CHARGE}
- COD surcharge: {COD_CHARGE} (if HAS_COD is true)
- Grand total = subtotal - discount + shipping + cod_charge

**3. Checkout (3-Step)**
```
Step 1: SHIPPING ADDRESS
  - Fields: firstName, lastName, email, phone, address, city, state, pincode, country
  - Validation: required fields, valid email regex, phone format per geography, pincode/zip format
  - States/provinces dropdown based on {GEOGRAPHY}
  - Country auto-set based on {GEOGRAPHY}

Step 2: PAYMENT METHOD SELECTION
  - Option A: Pay Online ({PAYMENT_GATEWAY}) — UPI/Cards/Netbanking/etc.
  - Option B: Cash on Delivery (+{COD_CHARGE} charge) — only if HAS_COD is true
  - Error display area

Step 3: CONFIRM & PAY
  - Review: name, address, phone, email
  - For online: Payment gateway checkout component triggers
  - For COD: Direct order placement with animation
```

**4. Online Payment Flow**
```
a. POST /api/payment/create-order
   - Creates order on payment gateway
   - Returns: orderId, amount, currency

b. Payment gateway modal/checkout opens
   - Prefilled: customer name, email, phone
   - Theme color: {PRIMARY_COLOR}
   - Brand name and logo displayed

c. On payment capture → POST /api/payment/verify
   - Verify signature (HMAC-SHA256 for Razorpay / webhook signature for Stripe)
   - Save order to Supabase (status: 'Order Confirmed')
   - Create shipping partner order → assign AWB → generate pickup
   - Update order status to 'Processing'
   - Send confirmation emails (customer + store)
   - Increment coupon usage + record redemption
   - Clear cart → redirect to /order-success?id={orderId}
```

**5. COD Order Flow**
```
a. POST /api/payment/cod-order
   - Save order (status: 'Order Confirmed', payment_method: 'COD')
   - Same shipping + email flow as online
   - Clear cart → redirect to /order-success
```

**6. Post-Order**
```
- /orders: Look up orders by email (stored in localStorage)
- /track?id={orderId}: Real-time tracking via shipping partner AWB
- Cancel order (within {CANCELLATION_WINDOW_HOURS}h, before shipping)
```

---

## 2. CANCELLATION FLOW

```
1. Customer clicks Cancel → selects reason → confirms
2. POST /api/orders/{id}/cancel
3. Validation:
   - Order exists
   - Not already cancelled
   - Not shipped/out for delivery/delivered
   - Within cancellation window ({CANCELLATION_WINDOW_HOURS}h)
4. If shipping_partner_order_id → Cancel on shipping partner API
5. If Prepaid + payment_id → Initiate refund on payment gateway
6. Update Supabase: status='Cancelled', cancellation fields, refund fields
7. Send cancellation emails:
   - Customer: reason, refund status, timeline
   - Store: full details + ACTION NEEDED flags if refund/shipping cancel failed
8. Return success message with refund timeline
```

---

## 3. SHIPPING INTEGRATION PATTERN

### Universal Shipping Adapter
The platform uses a shipping abstraction that adapts to the chosen partner:

| Feature | Shiprocket (India) | ShipStation (US) | Delhivery (India) |
|---------|-------------------|-------------------|-------------------|
| Auth | Email+Password → Bearer token | API Key + Secret | API Key |
| Token cache | 9 days | N/A | N/A |
| Create order | POST /orders/create/adhoc | POST /orders/createOrder | POST /cmu/create |
| Assign AWB | POST /courier/assign/awb | Auto on create | Auto on create |
| Generate pickup | POST /courier/generate/pickup | Auto | POST /pick/request |
| Track | GET /courier/track/awb/{awb} | GET /tracking/shipment | GET /track/recent |
| Cancel | POST /orders/cancel | POST /orders/cancel | POST /cancel |
| Webhook | Order status updates | Webhook events | Webhook events |

### Shipping Logic
- Free shipping threshold: {FREE_SHIPPING_THRESHOLD}
- Shipping charge below threshold: {SHIPPING_CHARGE}
- COD charge (if applicable): {COD_CHARGE}
- Pickup location: {PICKUP_CITY}
- Package weight: Sum of product weights × quantity (fallback: 0.25kg per item)
- Package dimensions: Product-specific or default (12×12×6 cm)
- HSN code: {HSN_CODE}
- Non-blocking failures: Order always saved, shipping failures tracked for manual re-sync

### Status Mapping (Shipping Partner → App)
```
PICKUP PENDING / ORDER PLACED  → "Order Confirmed"
PICKUP GENERATED / PROCESSING  → "Processing"
IN_TRANSIT / SHIPPED           → "Shipped"
OUT_FOR_DELIVERY               → "Out for Delivery"
DELIVERED                       → "Delivered"
CANCELLED                       → "Cancelled"
RTO / RETURN_INITIATED          → "Return Initiated"
RTO_DELIVERED                   → "Returned"
```

---

## 4. PAYMENT GATEWAY ADAPTER

### Razorpay (India)
```
Create Order:  razorpay.orders.create({ amount: paise, currency: 'INR', receipt })
Verify:        HMAC-SHA256(order_id|payment_id, key_secret) === signature
Refund:        razorpay.payments.refund(payment_id, { amount: paise, speed: 'normal' })
Webhook:       POST /api/payment/webhook
Script:        https://checkout.razorpay.com/v1/checkout.js
Prefill:       name, email, contact
Theme:         {PRIMARY_COLOR}
```

### Stripe (Global)
```
Create Intent: stripe.paymentIntents.create({ amount: cents, currency, metadata })
Confirm:       Client-side via Stripe.js
Refund:        stripe.refunds.create({ payment_intent: id, amount })
Webhook:       POST /api/payment/webhook (verify signature with webhook secret)
Elements:      @stripe/stripe-js + @stripe/react-stripe-js
```

---

## 5. COUPON SYSTEM

- Types: percentage discount OR fixed amount
- Validation chain: exists → active → not expired → usage limit → per-user limit → min order value
- Applied in cart, persisted in localStorage (key: `{brand}_coupon`)
- Redemption recorded in coupon_redemptions table
- Usage counter incremented via Supabase RPC `increment_coupon_usage`
- Per-user check: query coupon_redemptions for same coupon_id + user_email

---

## 6. EMAIL NOTIFICATION SYSTEM (Resend)

### 5 Transactional Emails:
1. **Order Confirmation** → Customer: Order ID, items table, address, payment method, estimated delivery, AWB
2. **New Order Alert** → Store: Order ID, customer details, total, links to admin/shipping dashboard
3. **Order Cancellation** → Customer: Order ID, reason, refund status and timeline
4. **Order Cancellation** → Store: Full details + ACTION NEEDED flags for failed refunds/shipping cancel
5. **Contact Form** → Store: Name, email, phone, message

### Email Design:
- Brand-consistent HTML: header bar in {PRIMARY_COLOR}, brand fonts
- Responsive layout, max-width 560px
- Support contact link ({SUPPORT_WHATSAPP} or {SUPPORT_EMAIL})
- From address: orders@{domain} (configured in Resend)

---

## 7. API ENDPOINTS

| Method | Path | Purpose |
|--------|------|---------|
| POST | /api/payment/create-order | Create payment gateway order |
| POST | /api/payment/verify | Verify payment + save order + shipping + email |
| POST | /api/payment/cod-order | Place COD order |
| POST | /api/payment/webhook | Payment gateway webhook |
| POST | /api/coupons/validate | Validate coupon code |
| POST | /api/contact | Contact form → email |
| GET/POST | /api/reviews | Product reviews CRUD |
| GET | /api/orders?email= | Get orders by email |
| GET | /api/orders/{id} | Get single order |
| POST | /api/orders/{id}/cancel | Cancel order + refund + shipping cancel |
| GET | /api/shipping/track?orderId= | Shipping partner tracking |
| POST | /api/shipping/webhook | Shipping partner status updates |
| POST | /api/admin/resync-shipping | Re-sync failed shipping orders |

---

## 8. AUTHENTICATION & SECURITY

### Customer Auth
- No mandatory signup — guest checkout allowed
- Email-based order lookup (stored in localStorage key: `{brand}_customer_email`)
- Optional: Supabase Auth for registered users (future enhancement)

### Admin Auth
- Dashboard login: Email + password → Supabase Auth → session cookie (`{brand}_session=authenticated`)
- Middleware: Checks session cookie on `/dashboard/*` and `/auth/*` routes
- Express API: JWT Bearer token verified via JWKS-RSA
- Admin RBAC: `profiles.is_admin` field check
- Service role: Supabase service_role key for admin operations (bypasses RLS)

### Security Measures
- Helmet.js (Express server)
- CORS with whitelisted origins
- HMAC-SHA256 payment signature verification
- Zod schema validation on ALL API inputs
- Supabase Row Level Security on every table
- Shipping partner token caching (prevent rate limits)
- 1MB JSON body limit
- Cancellation window enforcement
- Order status transition validation
- Input sanitization on contact form (min message length)
