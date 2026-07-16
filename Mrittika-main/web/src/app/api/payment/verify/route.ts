import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { saveOrder, updateOrder } from '@/lib/orderStore';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOrderConfirmationEmail } from '@/lib/notifications';
import { requireAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  console.log('[VERIFY] Payment verification started');

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    orderData,
    internalOrderId,
  } = body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return NextResponse.json({ success: false, error: 'Missing payment fields' }, { status: 400 });
  }

  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) {
    console.error('[VERIFY] RAZORPAY_KEY_SECRET not set');
    return NextResponse.json({ success: false, error: 'Server configuration error' }, { status: 500 });
  }

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    console.error('[VERIFY] Signature mismatch');
    return NextResponse.json({ success: false, error: 'Payment verification failed' }, { status: 400 });
  }

  console.log('[VERIFY] Signature verified ✓');

  const orderId = internalOrderId || `MRT-${Date.now()}`;

  const items = orderData?.items || [];
  const customer = orderData?.customer;

  if (!items.length || !customer?.email || !customer?.firstName) {
    console.error('[VERIFY] Missing order data:', {
      hasItems: items.length,
      hasCustomer: !!customer,
      hasEmail: !!customer?.email,
      hasName: !!customer?.firstName,
    });
    return NextResponse.json({
      success: false,
      error: 'Missing order information. Please contact support with payment ID: ' + razorpay_payment_id,
    }, { status: 400 });
  }

  const itemsSubtotal = items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
  const shippingCharge = itemsSubtotal >= 499 ? 0 : 49;
  const codCharge = 0;
  const discountAmt = orderData?.discountAmount || 0;
  const computedTotal = orderData?.total || (itemsSubtotal - discountAmt + shippingCharge + codCharge);

  const orderRecord = {
    id: orderId,
    razorpayOrderId: razorpay_order_id,
    razorpayPaymentId: razorpay_payment_id,
    paymentMethod: 'Prepaid',
    items,
    customer,
    subtotal: itemsSubtotal,
    shippingCharge,
    total: computedTotal,
    couponCode: orderData?.couponCode || null,
    discountAmount: discountAmt,
    status: 'Order Confirmed',
    createdAt: new Date().toISOString(),
  };

  console.log('[VERIFY] Order record prepared:', {
    id: orderId,
    items: items.length,
    customer: customer.email,
    subtotal: itemsSubtotal,
    shipping: shippingCharge,
    total: computedTotal,
    discount: discountAmt,
  });

  try {
    await saveOrder(orderRecord);
    console.log('[VERIFY] Order saved to Supabase ✓', orderId);
  } catch (saveError: any) {
    console.error('[VERIFY] Supabase save failed:', saveError.message);
    return NextResponse.json({
      success: false,
      error: 'Order could not be saved. Please contact support with payment ID: ' + razorpay_payment_id,
    }, { status: 500 });
  }

  let finalOrderRecord = { ...orderRecord };

  try {
    const shiprocketResult = await createShiprocketOrder(orderRecord);
    console.log('[VERIFY] Shiprocket order created ✓', shiprocketResult.shiprocketOrderId);

    await updateOrder(orderId, {
      status: 'Processing',
      shiprocketOrderId: shiprocketResult.shiprocketOrderId,
      shiprocketShipmentId: shiprocketResult.shipmentId,
      awbNumber: shiprocketResult.awbNumber,
      courierName: shiprocketResult.courierName,
    });

    await requireAdmin()
      .from('orders')
      .update({ shiprocket_sync_status: 'success', shiprocket_error: null })
      .eq('id', orderId);

    finalOrderRecord = {
      ...finalOrderRecord,
      status: 'Processing',
      ...shiprocketResult,
    };
  } catch (shiprocketError: any) {
    console.error('[VERIFY] SHIPROCKET FAILED:', shiprocketError.message);

    await requireAdmin()
      .from('orders')
      .update({ shiprocket_sync_status: 'failed', shiprocket_error: shiprocketError.message })
      .eq('id', orderId);
  }

  try {
    await sendOrderConfirmationEmail(finalOrderRecord);
    console.log('[VERIFY] Confirmation email sent ✓');
  } catch (emailError: any) {
    console.error('[VERIFY] Email failed (non-blocking):', emailError.message);
  }

  if (orderData?.couponCode) {
    try {
      await requireAdmin().rpc('increment_coupon_usage', { coupon_code: orderData.couponCode });
      console.log('[VERIFY] Coupon usage incremented ✓', orderData.couponCode);
    } catch (couponErr: any) {
      console.error('[VERIFY] Coupon increment failed (non-blocking):', couponErr.message);
    }

    try {
      const { data: couponRec } = await requireAdmin()
        .from('coupons')
        .select('id')
        .eq('code', orderData.couponCode.toUpperCase())
        .single();

      if (couponRec) {
        await requireAdmin().from('coupon_redemptions').insert({
          coupon_id: couponRec.id,
          user_email: orderData.customer.email.trim().toLowerCase(),
          order_id: orderId,
        });
        console.log('[VERIFY] Coupon redemption recorded ✓');
      }
    } catch (redeemErr: any) {
      console.error('[VERIFY] Coupon redemption record failed (non-blocking):', redeemErr.message);
    }
  }

  return NextResponse.json({
    success: true,
    orderId,
    message: 'Order placed successfully',
  });
}
