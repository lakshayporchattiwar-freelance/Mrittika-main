# UNIVERSAL D2C E-COMMERCE PLATFORM — AI GENERATION CONTEXT

> **What this is**: A complete architectural blueprint for a production-grade D2C e-commerce platform with admin dashboard. When you provide this context + a client brief to an AI, it generates fully tailored PRD, TRD, App Flow, Design.md, Data Schema, Security Architecture, and Implementation Plan for THAT specific brand.

---

## HOW TO USE

### Step 1: Fill in the Client Brief below
### Step 2: Paste the ENTIRE contents of all files in this folder into Claude/AI
### Step 3: Add this instruction at the top:

```
You have the complete Universal D2C Platform Context and the Client Brief below.
Generate ALL of the following documents, fully tailored to this client:

1. PRD (Product Requirements Document)
2. TRD (Technical Requirements Document)  
3. App Flow (text-based flow diagrams)
4. Design.md (design system, tokens, components, typography, colors)
5. Data Schema (complete SQL migrations + RLS + indexes + seed data)
6. Security Architecture
7. Implementation Plan (phased, file-by-file with estimates)

Every document must be fully customized for this client — use their brand name, colors, fonts, product types, currency, shipping partners, payment gateways, etc. Do NOT leave generic placeholders. Make concrete decisions based on the client brief.
```

---

## CLIENT BRIEF TEMPLATE

Fill this out for each new client and include it with the context:

```yaml
# === BRAND IDENTITY ===
BRAND_NAME: ""                    # e.g. "Aurélia", "SkinCraft", "Terra & Co"
TAGLINE: ""                       # e.g. "Clean Beauty for Modern Skin"
BRAND_PERSONALITY: ""            # e.g. "minimal luxury", "earthy organic", "bold urban", "playful youthful"
INDUSTRY: ""                      # e.g. "skincare", "fashion", "home decor", "food & beverages", "jewelry"
FOUNDER_NAME: ""                  # e.g. "Priya Sharma"
FOUNDER_STORY: ""                 # 2-3 sentence origin story
TARGET_AUDIENCE: ""               # e.g. "Women 25-40, urban India, value-conscious"
GEOGRAPHY: ""                     # e.g. "India", "USA", "Global"

# === PRODUCT ===
PRODUCT_TYPES: ""                  # e.g. "face packs, serums, moisturizers" / "sarees, kurtas, jewelry" / "candles, diffusers"
PRODUCT_COUNT: ""                  # e.g. "3-5 initially, scaling to 20+"
PRODUCT_ATTRIBUTES: ""            # What varies per product? e.g. "size, shade, fragrance, weight"
PRODUCT_CATEGORIES: ""            # e.g. "Cleanser, Serum, Moisturizer, Kit, Bundle"
AVERAGE_PRICE_POINT: ""           # e.g. "₹199-₹599", "$25-$75"
HAS_VARIANTS: ""                   # e.g. "yes — size 50g/100g" or "no"

# === BUSINESS ===
CURRENCY: ""                      # e.g. "INR", "USD", "EUR"
CURRENCY_SYMBOL: ""               # e.g. "₹", "$", "€"
PAYMENT_GATEWAY: ""               # e.g. "Razorpay" (India), "Stripe" (Global), "PayPal"
SHIPPING_PARTNER: ""              # e.g. "Shiprocket" (India), "ShipStation" (US), "Delhivery" (India)
HAS_COD: ""                       # e.g. "yes" or "no"
FREE_SHIPPING_THRESHOLD: ""      # e.g. "499", "75" (in local currency)
SHIPPING_CHARGE: ""               # e.g. "49", "5.99"
COD_CHARGE: ""                    # e.g. "49", "0"
CANCELLATION_WINDOW_HOURS: ""     # e.g. "24", "48"
PICKUP_CITY: ""                   # e.g. "Mumbai", "New York"
HSN_CODE: ""                      # e.g. "33049900" (cosmetics), "6204" (clothing), "3406" (candles)
SUPPORT_EMAIL: ""                 # e.g. "hello@brand.com"
SUPPORT_PHONE: ""                 # e.g. "+91 9876543210"
SUPPORT_WHATSAPP: ""              # e.g. "+91 9876543210" or "none"

# === DESIGN ===
PRIMARY_COLOR: ""                  # e.g. "#c1622b", "#2563eb", "#10b981"
SECONDARY_COLOR: ""               # e.g. "#ddd0bc", "#f59e0b", "#8b5cf6"
BACKGROUND_COLOR: ""              # e.g. "#f7f0e6", "#ffffff", "#0f172a"
DARK_TEXT_COLOR: ""               # e.g. "#3b2e24", "#1e293b", "#f8fafc"
ACCENT_COLOR: ""                  # e.g. "#7a9e6e", "#f97316", "#06b6d4"
HEADING_FONT: ""                  # e.g. "Cormorant Garamond", "Playfair Display", "Inter"
BODY_FONT: ""                     # e.g. "DM Sans", "Inter", "Source Sans Pro"
DESIGN_MOOD: ""                   # e.g. "earthy warm", "minimal monochrome", "vibrant playful", "dark luxury"
HAS_VIDEO_HERO: ""                # e.g. "yes" or "no"
HAS_FOUNDER_SECTION: ""          # e.g. "yes" or "no"
HAS_TESTIMONIALS: ""              # e.g. "video" or "text" or "both"
HERO_STYLE: ""                    # e.g. "video frame sequence", "static image + parallax", "carousel"

# === TECH ===
ORDER_ID_PREFIX: ""               # e.g. "AUR", "SKC", "TRC"
HOSTING: ""                       # e.g. "Vercel", "AWS Amplify", "Netlify"
ANALYTICS_IDS: ""                 # e.g. "GA-XXXXX, GTM-XXXXX"
DOMAIN: ""                        # e.g. "brand.com"
```
