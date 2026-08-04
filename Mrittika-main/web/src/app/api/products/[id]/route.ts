import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const supabase = requireAdmin()

  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !product) {
    return NextResponse.json({ product: null }, { status: 404 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const sourceImages = product.images && product.images.length > 0 ? product.images : (product.image_url ? [product.image_url] : [])
  const resolvedImages = sourceImages.map((url: string) => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${supabaseUrl}/storage/v1/object/public${url}`
    return url
  })

  const fallback = `/images/products/${product.slug}.webp`
  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: resolvedImages[0] || fallback,
      images: resolvedImages.length > 0 ? resolvedImages : [fallback],
    },
  })
}
