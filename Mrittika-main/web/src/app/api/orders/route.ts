import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');

  if (!email) {
    return NextResponse.json(
      { error: 'Email is required to fetch orders' },
      { status: 400 }
    );
  }

  const normalizedEmail = email.trim().toLowerCase();

  const { data: orders, error } = await supabaseAdmin!
    .from('orders')
    .select('*, order_items(*)')
    .ilike('customer_email', normalizedEmail)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[ORDERS-LIST] Supabase error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }

  const mappedOrders = (orders || []).map((order: any) => ({
    id: order.id,
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    paymentMethod: order.payment_method,
    items: (order.order_items || []).map((item: any) => ({
      id: item.id,
      name: item.product_name,
      slug: item.product_slug,
      price: item.unit_price,
      qty: item.quantity,
      image: `/images/products/${item.product_slug}.webp`,
    })),
    customer: {
      firstName: order.customer_name.split(' ')[0] || '',
      lastName: order.customer_name.split(' ').slice(1).join(' ') || '',
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
      country: order.shipping_country,
    },
    total: order.total,
    status: order.status,
    shiprocketOrderId: order.shiprocket_order_id,
    shiprocketShipmentId: order.shiprocket_shipment_id,
    awbNumber: order.awb_number,
    courierName: order.courier_name,
    cancellationReason: order.cancellation_reason,
    cancelledAt: order.cancelled_at,
    refundStatus: order.refund_status,
    refundAmount: order.refund_amount,
    createdAt: order.created_at,
  }));

  return NextResponse.json({ orders: mappedOrders });
}
