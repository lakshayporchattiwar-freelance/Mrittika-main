import { NextRequest, NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req: NextRequest) {
  console.log('[CREATE-ORDER] Starting order creation');

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[CREATE-ORDER] Missing Razorpay credentials:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
    });
    return NextResponse.json(
      { error: 'Payment gateway not configured' },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { amount, receipt } = body;

  if (!amount || typeof amount !== 'number' || amount <= 0) {
    console.error('[CREATE-ORDER] Invalid amount:', amount);
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  try {
    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const order = await razorpay.orders.create({
      amount: Math.round(amount),
      currency: 'INR',
      receipt: receipt || `MRT-${Date.now()}`,
    });

    console.log('[CREATE-ORDER] Order created:', order.id);

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err: any) {
    console.error('[CREATE-ORDER] Razorpay error:', err);
    return NextResponse.json(
      { error: err.message || 'Failed to create payment order' },
      { status: 500 }
    );
  }
}
