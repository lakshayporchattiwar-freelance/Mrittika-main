import { requireAdmin } from "./supabase"

export interface ProductUgc {
  id: string
  product_slug: string
  video_url: string
  thumbnail_url?: string
  name_handle?: string
  rating?: number
  quote?: string
  sort_order: number
}

export async function getUgcForProduct(slug: string): Promise<ProductUgc[]> {
  const supabase = requireAdmin()
  const { data, error } = await supabase
    .from("product_ugc")
    .select("*")
    .eq("product_slug", slug)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })
  if (error || !data) return []
  return data as ProductUgc[]
}
