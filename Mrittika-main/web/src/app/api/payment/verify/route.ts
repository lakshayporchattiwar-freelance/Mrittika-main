import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  console.log('[VERIFY] Payment verification started');

  let body: any;
  try {
    body = await req.json();
    console.log('[VERIFY] Body received:', {
      hasOrderId: !!body.razorpay_order_id,
      hasPaymentId: !!body.razorpay_payment_id,
      hasSignature: !!body.razorpay_signature,
      hasOrderData: !!body.orderData,
      hasInternalOrderId: !!body.internalOrderId,
    });
  } catch (e) {
    console.error('[VERIFY] Failed to parse request body:', e);
    return NextResponse.json(
      { success: false, error: 'Invalid request body' },
      { status: 400 }
    );
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
    internalOrderId,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    console.error('[VERIFY] Missing Razorpay fields', {
      razorpay_order_id,
      razorpay_payment_id,
      hasSignature: !!razorpay_signature,
    });
    return NextResponse.json(
      { success: false, error: 'Missing payment fields' },
      { status: 400 }
    );
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[VERIFY] RAZORPAY_KEY_SECRET is not set in environment');
    return NextResponse.json(
      { success: false, error: 'Server configuration error' },
      { status: 500 }
    );
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    console.log('[VERIFY] Signature comparison:', {
      expected: expectedSignature.substring(0, 10) + '...',
      received: razorpay_signature.substring(0, 10) + '...',
      match: expectedSignature === razorpay_signature,
    });

    if (expectedSignature !== razorpay_signature) {
      console.error('[VERIFY] Signature mismatch — possible key mismatch or tampered payload');
      return NextResponse.json(
        { success: false, error: 'Payment verification failed' },
        { status: 400 }
      );
    }

    console.log('[VERIFY] Signature verified successfully');

    const orderId = internalOrderId || `MRT-${Date.now()}`;

    try {
      const { createShiprocketOrder } = await import('@/lib/shiprocket');
      const { saveOrder, updateOrder } = await import('@/lib/orderStore');

      const orderRecord: import('@/lib/types').OrderRecord = {
        id: orderId,
        razorpayOrderId: razorpay_order_id,
        razorpayPaymentId: razorpay_payment_id,
        items: orderData?.items || [],
        customer: orderData?.customer || ({} as import('@/lib/types').CustomerInfo),
        total: orderData?.total || 0,
        paymentMethod: 'Prepaid',
        status: 'Order Confirmed',
        createdAt: new Date().toISOString(),
      };

      await saveOrder(orderRecord);
      console.log('[VERIFY] Order saved:', orderId);

      try {
        const shiprocketResult = await createShiprocketOrder(orderRecord);
        await updateOrder(orderId, {
          shiprocketOrderId: shiprocketResult.shiprocketOrderId,
          shiprocketShipmentId: shiprocketResult.shipmentId,
          status: 'Processing',
        });
        console.log('[VERIFY] Shiprocket order created:', shiprocketResult.shiprocketOrderId);
      } catch (shiprocketError) {
        console.error('[VERIFY] Shiprocket failed (non-blocking):', shiprocketError);
      }

    } catch (orderError) {
      console.error('[VERIFY] Order save failed (non-blocking):', orderError);
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Payment verified successfully',
    });

  } catch (err) {
    console.error('[VERIFY] Unexpected error during verification:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during verification' },
      { status: 500 }
    );
  }
}
