import { requireAdmin } from "./supabase"

export interface ShopProduct {
  id: string
  name: string
  slug: string
  price: number
  comparePrice?: number
  rating: number
  reviewCount: number
  shortDescription: string
  image: string
  images: string[]
  description?: string
  benefits?: string[]
  ingredients?: string[]
  howToUse?: string[]
  goodToKnow?: string
  category?: string
  weight?: number
  stockQuantity?: number
  status?: string
  isNew?: boolean
}

function normalizeCategory(p: any): string | undefined {
  const raw = (p.category || "").trim()
  const lower = raw.toLowerCase()
  if (lower.includes("face")) return "Face"
  if (lower.includes("body") || lower.includes("soap")) return "Body"
  if (lower.includes("bundle") || lower.includes("kit")) return "Bundles"
  if (raw) return raw
  const slug = (p.slug || "").toLowerCase()
  const name = (p.name || "").toLowerCase()
  if (slug.includes("face") || name.includes("face pack") || name.includes("face-pack")) return "Face"
  if (slug.includes("soap") || name.includes("soap")) return "Body"
  if (slug.includes("bundle") || name.includes("bundle")) return "Bundles"
  return undefined
}

export async function getShopProducts(): Promise<ShopProduct[]> {
  const supabase = requireAdmin()

  const [
    { data: products },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("status", "Active").order("created_at", { ascending: false }),
    supabase.from("reviews").select("product_slug, rating"),
  ])

  if (!products || products.length === 0) return []

  const reviewMap = new Map<string, { count: number; total: number }>()
  for (const r of reviews || []) {
    const entry = reviewMap.get(r.product_slug) || { count: 0, total: 0 }
    entry.count++
    entry.total += r.rating
    reviewMap.set(r.product_slug, entry)
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""

  return products.map((p: any) => {
    const resolvedImages = (p.images && p.images.length > 0 ? p.images : (p.image_url ? [p.image_url] : [])).map((url: string) => {
      if (!url) return url
      if (url.startsWith("http://") || url.startsWith("https://")) return url
      if (url.startsWith("/")) return `${supabaseUrl}/storage/v1/object/public${url}`
      return url
    })

    const primaryImage = resolvedImages[0] || `/images/products/${p.slug}.webp`
    const rev = reviewMap.get(p.slug)
    const avgRating = rev ? Math.round((rev.total / rev.count) * 10) / 10 : 4.5
    const revCount = rev?.count || 0

    return {
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.price,
      comparePrice: p.compare_price || undefined,
      rating: avgRating,
      reviewCount: revCount,
      shortDescription: p.description || "",
      image: primaryImage,
      images: resolvedImages.length > 0 ? resolvedImages : [primaryImage],
      description: p.description || undefined,
      benefits: p.benefits || undefined,
      ingredients: p.ingredients || undefined,
      howToUse: p.how_to_use || undefined,
      goodToKnow: p.good_to_know || undefined,
      category: normalizeCategory(p),
      weight: p.weight || undefined,
      stockQuantity: p.stock_quantity ?? p.stock ?? undefined,
      status: p.status || undefined,
      isNew: p.is_new || undefined,
    }
  })
}

export async function getShopProductBySlug(slug: string): Promise<ShopProduct | null> {
  const all = await getShopProducts()
  return all.find((p) => p.slug === slug) || null
}
