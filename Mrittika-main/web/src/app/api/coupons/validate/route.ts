import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ valid: false, error: 'Invalid request' }, { status: 400 });
  }

  const { code, subtotal, email } = body;

  if (!code || typeof subtotal !== 'number') {
    return NextResponse.json({ valid: false, error: 'Code and subtotal are required' }, { status: 400 });
  }

  const normalizedCode = code.trim().toUpperCase();
  const normalizedEmail = (email || '').trim().toLowerCase();

  const { data: coupon, error } = await supabaseAdmin!
    .from('coupons')
    .select('*')
    .eq('code', normalizedCode)
    .single();

  if (error || !coupon) {
    return NextResponse.json({ valid: false, error: 'Invalid coupon code' }, { status: 404 });
  }

  if (!coupon.is_active) {
    return NextResponse.json({ valid: false, error: 'This coupon is no longer active' }, { status: 400 });
  }

  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    return NextResponse.json({ valid: false, error: 'This coupon has expired' }, { status: 400 });
  }

  if (coupon.max_uses && coupon.used_count >= coupon.max_uses) {
    return NextResponse.json({ valid: false, error: 'This coupon has reached its usage limit' }, { status: 400 });
  }

  if (coupon.min_order_value && subtotal < coupon.min_order_value) {
    return NextResponse.json({
      valid: false,
      error: `This coupon requires a minimum order of Rs.${coupon.min_order_value}`,
    }, { status: 400 });
  }

  if (normalizedEmail) {
    const { count } = await supabaseAdmin!
      .from('coupon_redemptions')
      .select('id', { count: 'exact', head: true })
      .eq('coupon_id', coupon.id)
      .eq('user_email', normalizedEmail);

    if (count && count > 0) {
      return NextResponse.json({ valid: false, error: 'You have already used this coupon code' }, { status: 400 });
    }
  }

  let discountAmount = 0;
  if (coupon.discount_type === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.discount_value) / 100);
  } else {
    discountAmount = coupon.discount_value;
  }

  discountAmount = Math.min(discountAmount, subtotal);

  return NextResponse.json({
    valid: true,
    code: normalizedCode,
    discountType: coupon.discount_type,
    discountValue: coupon.discount_value,
    discountAmount,
    message: coupon.discount_type === 'percentage'
      ? `${coupon.discount_value}% off applied! You saved Rs.${discountAmount}`
      : `Rs.${coupon.discount_value} off applied! You saved Rs.${discountAmount}`,
  });
}
