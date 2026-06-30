import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
    return NextResponse.json({ error: 'slug is required' }, { status: 400 });
  }

  const { data: reviews, error } = await supabaseAdmin!
    .from('reviews')
    .select('*')
    .eq('product_slug', slug)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[REVIEWS-GET] Supabase error:', error);
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 });
  }

  const average = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  return NextResponse.json({
    reviews: reviews || [],
    count: reviews?.length || 0,
    average: Math.round(average * 10) / 10,
  });
}

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { productSlug, customerName, rating, comment } = body;

  if (!productSlug || !customerName || !rating || !comment) {
    return NextResponse.json(
      { error: 'productSlug, customerName, rating, and comment are all required' },
      { status: 400 }
    );
  }

  if (typeof rating !== 'number' || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'rating must be between 1 and 5' }, { status: 400 });
  }

  if (comment.trim().length < 10) {
    return NextResponse.json({ error: 'Review must be at least 10 characters' }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin!
    .from('reviews')
    .insert({
      product_slug: productSlug,
      name: customerName.trim().slice(0, 60),
      rating,
      comment: comment.trim().slice(0, 1000),
      verified: false,
    })
    .select()
    .single();

  if (error) {
    console.error('[REVIEWS-POST] Supabase error:', error);
    return NextResponse.json({ error: 'Failed to submit review' }, { status: 500 });
  }

  console.log('[REVIEWS-POST] New review saved:', data.id, 'for', productSlug);

  return NextResponse.json({ success: true, review: data });
}
