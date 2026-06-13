import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { getOrderByRazorpayOrderId, updateOrder } from '@/lib/orderStore';
import { createShiprocketOrder } from '@/lib/shiprocket';

export async function POST(req: NextRequest) {
  console.log('[RAZORPAY-VERIFY] Payment verification started');

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[RAZORPAY-VERIFY] RAZORPAY_KEY_SECRET is not set in environment');
    return NextResponse.json(
      { error: 'Server configuration error' },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    console.error('[RAZORPAY-VERIFY] Failed to parse request body:', e);
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body as {
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
  };

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    console.error('[RAZORPAY-VERIFY] Missing payment details');
    return NextResponse.json({ error: 'Missing payment details' }, { status: 400 });
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest('hex');

    console.log('[RAZORPAY-VERIFY] Signature comparison:', {
      expected: expectedSignature.substring(0, 10) + '...',
      received: razorpaySignature.substring(0, 10) + '...',
      match: expectedSignature === razorpaySignature,
    });

    if (expectedSignature !== razorpaySignature) {
      console.error('[RAZORPAY-VERIFY] Signature mismatch');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('[RAZORPAY-VERIFY] Signature verified successfully');

    const order = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      console.error('[RAZORPAY-VERIFY] Order not found for Razorpay order:', razorpayOrderId);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    await updateOrder(order.id, {
      razorpayPaymentId,
      status: 'Payment Verified',
    });

    try {
      const shiprocketResult = await createShiprocketOrder(order);
      await updateOrder(order.id, {
        shiprocketOrderId: shiprocketResult.shiprocketOrderId,
        shiprocketShipmentId: shiprocketResult.shipmentId,
        status: 'Processing',
      });
      console.log('[RAZORPAY-VERIFY] Shiprocket order created:', shiprocketResult.shiprocketOrderId);
    } catch (shiprocketError) {
      console.error('[RAZORPAY-VERIFY] Shiprocket failed (payment still verified):', shiprocketError);
      await updateOrder(order.id, { status: 'Payment Verified' });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: 'Payment Verified',
    });

  } catch (error) {
    console.error('[RAZORPAY-VERIFY] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Verification failed' },
      { status: 500 }
    );
  }
}
