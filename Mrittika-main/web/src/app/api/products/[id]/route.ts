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
  const resolvedImages = (product.images || []).map((url: string) => {
    if (!url) return url
    if (url.startsWith('http://') || url.startsWith('https://')) return url
    if (url.startsWith('/')) return `${supabaseUrl}/storage/v1/object/public${url}`
    return url
  })

  return NextResponse.json({
    product: {
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      image: resolvedImages[0] || `/images/products/${product.slug}.webp`,
      images: resolvedImages,
    },
  })
}
