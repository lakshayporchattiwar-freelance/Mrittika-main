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

  const orderRecord = {
    id: orderId,
    razorpayOrderId: undefined,
    razorpayPaymentId: undefined,
    paymentMethod: 'COD',
    items: orderData.items,
    customer: orderData.customer,
    total: total,
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

  return NextResponse.json({
    success: true,
    orderId,
    message: 'COD order placed successfully',
  });
}
