import { requireAdmin } from "./supabase"

export interface ShopProduct {
  id: string
  name: string
  slug: string
  price: number
  rating: number
  reviewCount: number
  shortDescription: string
  image: string
  images: string[]
  description?: string
  ingredients?: string[]
  howToUse?: string[]
}

export async function getShopProducts(): Promise<ShopProduct[]> {
  const supabase = requireAdmin()

  const [
    { data: products },
    { data: reviews },
  ] = await Promise.all([
    supabase.from("products").select("*").eq("is_active", true).eq("status", "Active").order("created_at", { ascending: false }),
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
      rating: avgRating,
      reviewCount: revCount,
      shortDescription: p.description || "",
      image: primaryImage,
      images: resolvedImages.length > 0 ? resolvedImages : [primaryImage],
      description: p.description || undefined,
      ingredients: p.ingredients || undefined,
      howToUse: p.how_to_use || undefined,
    }
  })
}

export async function getShopProductBySlug(slug: string): Promise<ShopProduct | null> {
  const all = await getShopProducts()
  return all.find((p) => p.slug === slug) || null
}
