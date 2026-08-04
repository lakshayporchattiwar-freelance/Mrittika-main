import { NextRequest, NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim().toLowerCase() || ''
  const slugs = searchParams.get('slugs')?.trim() || ''

  const supabase = requireAdmin()

  if (slugs) {
    const slugList = slugs.split(',').map((s) => s.trim()).filter(Boolean)
    if (slugList.length === 0) {
      return NextResponse.json({ products: [] })
    }

    const { data, error } = await supabase
      .from('products')
      .select('id, name, slug, price, description, images')
      .eq('is_active', true)
      .in('slug', slugList)

    if (error) {
      return NextResponse.json({ products: [] })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''

    const products = (data || []).map((p: any) => {
      const resolvedImages = (p.images || []).map((url: string) => {
        if (!url) return url
        if (url.startsWith('http://') || url.startsWith('https://')) return url
        if (url.startsWith('/')) return `${supabaseUrl}/storage/v1/object/public${url}`
        return url
      })
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        price: p.price,
        shortDescription: p.description || '',
        image: resolvedImages[0] || `/images/products/${p.slug}.webp`,
        images: resolvedImages.length > 0 ? resolvedImages : [`/images/products/${p.slug}.webp`],
      }
    })

    return NextResponse.json({ products })
  }

  if (!q) {
    return NextResponse.json({ products: [] })
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, price, description')
    .eq('is_active', true)
    .eq('status', 'Active')
    .or(`name.ilike.%${q}%,description.ilike.%${q}%`)
    .limit(10)

  if (error) {
    return NextResponse.json({ products: [] })
  }

  const products = (data || []).map((p: any) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    price: p.price,
    shortDescription: p.description || '',
  }))

  return NextResponse.json({ products })
}
