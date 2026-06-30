import { NextRequest, NextResponse } from 'next/server';
import { saveOrder, updateOrder } from '@/lib/orderStore';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOrderConfirmationEmail } from '@/lib/notifications';
import { supabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  console.log('[COD] COD order started');

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ success: false, error: 'Invalid request body' }, { status: 400 });
  }

  const { orderData, total } = body;

  if (!orderData?.customer?.email || !orderData?.items?.length) {
    console.error('[COD] Missing order data:', { hasCustomer: !!orderData?.customer, hasItems: !!orderData?.items?.length });
    return NextResponse.json({
      success: false,
      error: 'Missing order information. Please fill all required fields.',
    }, { status: 400 });
  }

  const orderId = `MRT-COD-${Date.now()}`;

  const itemsSubtotal = orderData.items.reduce((sum: number, item: any) => sum + (item.price * item.qty), 0);
  const shippingCharge = itemsSubtotal >= 499 ? 0 : 49;
  const codCharge = 49;

  const orderRecord = {
    id: orderId,
    razorpayOrderId: undefined,
    razorpayPaymentId: undefined,
    paymentMethod: 'COD',
    items: orderData.items,
    customer: orderData.customer,
    subtotal: itemsSubtotal,
    shippingCharge: shippingCharge,
    total: total,
    couponCode: orderData.couponCode || null,
    discountAmount: orderData.discountAmount || 0,
    status: 'Order Confirmed',
    createdAt: new Date().toISOString(),
  };

  try {
    await saveOrder(orderRecord);
    console.log('[COD] Order saved to Supabase ✓', orderId);
  } catch (saveError: any) {
    console.error('[COD] Supabase save failed:', saveError.message);
    return NextResponse.json({
      success: false,
      error: 'Failed to place order. Please try again or contact support.',
    }, { status: 500 });
  }

  let finalOrderRecord = { ...orderRecord };

  try {
    const shiprocketResult = await createShiprocketOrder(orderRecord);
    console.log('[COD] Shiprocket order created ✓', shiprocketResult.shiprocketOrderId);

    await updateOrder(orderId, {
      status: 'Processing',
      shiprocketOrderId: shiprocketResult.shiprocketOrderId,
      shiprocketShipmentId: shiprocketResult.shipmentId,
      awbNumber: shiprocketResult.awbNumber,
      courierName: shiprocketResult.courierName,
    });

    await supabaseAdmin!
      .from('orders')
      .update({ shiprocket_sync_status: 'success', shiprocket_error: null })
      .eq('id', orderId);

    finalOrderRecord = { ...finalOrderRecord, status: 'Processing', ...shiprocketResult };
  } catch (shiprocketError: any) {
    console.error('[COD] SHIPROCKET FAILED:', shiprocketError.message);

    await supabaseAdmin!
      .from('orders')
      .update({ shiprocket_sync_status: 'failed', shiprocket_error: shiprocketError.message })
      .eq('id', orderId);
  }

  try {
    await sendOrderConfirmationEmail(finalOrderRecord);
    console.log('[COD] Confirmation email sent ✓');
  } catch (emailError: any) {
    console.error('[COD] Email failed (non-blocking):', emailError.message);
  }

  if (orderData?.couponCode) {
    try {
      await supabaseAdmin!.rpc('increment_coupon_usage', { coupon_code: orderData.couponCode });
      console.log('[COD] Coupon usage incremented ✓', orderData.couponCode);
    } catch (couponErr: any) {
      console.error('[COD] Coupon increment failed (non-blocking):', couponErr.message);
    }

    try {
      const { data: couponRec } = await supabaseAdmin!
        .from('coupons')
        .select('id')
        .eq('code', orderData.couponCode.toUpperCase())
        .single();

      if (couponRec) {
        await supabaseAdmin!.from('coupon_redemptions').insert({
          coupon_id: couponRec.id,
          user_email: orderData.customer.email.trim().toLowerCase(),
          order_id: orderId,
        });
        console.log('[COD] Coupon redemption recorded ✓');
      }
    } catch (redeemErr: any) {
      console.error('[COD] Coupon redemption record failed (non-blocking):', redeemErr.message);
    }
  }

  return NextResponse.json({
    success: true,
    orderId,
    message: 'COD order placed successfully',
  });
}
