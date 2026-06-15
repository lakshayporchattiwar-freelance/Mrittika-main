import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orderStore';
import { cancelShiprocketOrder } from '@/lib/shiprocket';
import { refundRazorpayPayment } from '@/lib/razorpay';
import { supabaseAdmin } from '@/lib/supabase';
import { sendOrderCancellationEmail } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: orderId } = await params;
  console.log('[CANCEL] Cancellation requested for order:', orderId);

  let body: any = {};
  try {
    body = await req.json();
  } catch (e) {
    // body is optional, reason may be empty
  }

  const reason = body.reason || 'No reason provided';

  const order = await getOrderById(orderId);

  if (!order) {
    return NextResponse.json(
      { success: false, error: 'Order not found' },
      { status: 404 }
    );
  }

  if (order.status === 'Cancelled') {
    return NextResponse.json(
      { success: false, error: 'This order is already cancelled' },
      { status: 400 }
    );
  }

  if (order.status === 'Delivered' || order.status === 'Out for Delivery') {
    return NextResponse.json(
      {
        success: false,
        error: 'This order cannot be cancelled at this stage. Please refuse the delivery or contact us on WhatsApp 6000386664 for a return.',
      },
      { status: 400 }
    );
  }

  if (order.status === 'Shipped') {
    return NextResponse.json(
      {
        success: false,
        error: 'This order has already been shipped. Please refuse the delivery or contact us on WhatsApp 6000386664 for a return.',
      },
      { status: 400 }
    );
  }

  const orderAgeMs = Date.now() - new Date(order.createdAt).getTime();
  const twentyFourHoursMs = 24 * 60 * 60 * 1000;

  if (orderAgeMs > twentyFourHoursMs) {
    return NextResponse.json(
      {
        success: false,
        error: 'Cancellation window has closed. Orders can only be cancelled within 24 hours of placement. Contact us on WhatsApp 6000386664 for help.',
      },
      { status: 400 }
    );
  }

  let shiprocketCancelStatus = 'not_applicable';
  let shiprocketMessage = '';

  if (order.shiprocketOrderId) {
    try {
      const result = await cancelShiprocketOrder(order.shiprocketOrderId);
      shiprocketCancelStatus = result.success ? 'cancelled' : 'failed';
      shiprocketMessage = result.message;
      console.log('[CANCEL] Shiprocket result:', shiprocketCancelStatus, shiprocketMessage);
    } catch (err: any) {
      shiprocketCancelStatus = 'failed';
      shiprocketMessage = err.message;
      console.error('[CANCEL] Shiprocket cancel threw error:', err.message);
    }
  } else {
    console.log('[CANCEL] No shiprocketOrderId on this order, skipping Shiprocket cancel');
  }

  let refundResult: { success: boolean; refundId?: string; message: string } | null = null;

  if (order.paymentMethod === 'Prepaid' && order.razorpayPaymentId) {
    refundResult = await refundRazorpayPayment(
      order.razorpayPaymentId,
      order.total,
      reason
    );
    console.log('[CANCEL] Refund result:', refundResult);
  } else {
    console.log('[CANCEL] No refund needed (COD order or no payment ID)');
  }

  const dbUpdates: any = {
    status: 'Cancelled',
    cancellation_reason: reason,
    cancelled_at: new Date().toISOString(),
    shiprocket_cancel_status: shiprocketCancelStatus,
    updated_at: new Date().toISOString(),
  };

  if (refundResult) {
    dbUpdates.refund_id = refundResult.refundId || null;
    dbUpdates.refund_status = refundResult.success ? 'processing' : 'failed';
    dbUpdates.refund_amount = order.total;
  }

  const { error: updateError } = await supabaseAdmin!
    .from('orders')
    .update(dbUpdates)
    .eq('id', orderId);

  if (updateError) {
    console.error('[CANCEL] Failed to update order in Supabase:', updateError);
    return NextResponse.json(
      { success: false, error: 'Failed to record cancellation. Please contact support.' },
      { status: 500 }
    );
  }

  try {
    await sendOrderCancellationEmail(order, {
      reason,
      refundInitiated: refundResult?.success || false,
      refundAmount: order.paymentMethod === 'Prepaid' ? order.total : undefined,
      shiprocketCancelStatus,
    });
    console.log('[CANCEL] Cancellation emails sent');
  } catch (emailError: any) {
    console.error('[CANCEL] Cancellation email failed (non-blocking):', emailError.message);
  }

  let customerMessage = 'Your order has been cancelled.';

  if (order.paymentMethod === 'Prepaid') {
    if (refundResult?.success) {
      customerMessage = `Your order has been cancelled. A refund of ₹${order.total} has been initiated and will reflect in your original payment method within 5-7 business days.`;
    } else {
      customerMessage = `Your order has been cancelled. There was an issue initiating your refund automatically — our team has been notified and will process your refund of ₹${order.total} manually within 5-7 business days. Contact us on WhatsApp 6000386664 if you don't see it.`;
    }
  } else {
    customerMessage = 'Your COD order has been cancelled successfully.';
  }

  if (shiprocketCancelStatus === 'failed' && order.shiprocketOrderId) {
    console.warn('[CANCEL] Order marked cancelled in our system but Shiprocket cancel may need manual follow-up:', shiprocketMessage);
  }

  return NextResponse.json({
    success: true,
    message: customerMessage,
    shiprocketCancelStatus,
    refund: refundResult,
  });
}
