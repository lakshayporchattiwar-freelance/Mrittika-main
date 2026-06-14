import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { updateOrder } from '@/lib/orderStore';

export async function POST(req: NextRequest) {
  const { data: failedOrders, error } = await supabaseAdmin!
    .from('orders')
    .select('*, order_items(*)')
    .eq('shiprocket_sync_status', 'failed');

  if (error || !failedOrders) {
    return NextResponse.json({ error: 'Could not fetch failed orders' }, { status: 500 });
  }

  const results = [];

  for (const order of failedOrders) {
    const orderRecord = {
      id: order.id,
      paymentMethod: order.payment_method,
      items: order.order_items.map((item: any) => ({
        name: item.product_name,
        slug: item.product_slug,
        price: item.unit_price,
        qty: item.quantity,
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
    };

    try {
      const result = await createShiprocketOrder(orderRecord);
      await updateOrder(order.id, {
        status: 'Processing',
        shiprocketOrderId: result.shiprocketOrderId,
        shiprocketShipmentId: result.shipmentId,
        awbNumber: result.awbNumber,
        courierName: result.courierName,
      });
      await supabaseAdmin!
        .from('orders')
        .update({ shiprocket_sync_status: 'success', shiprocket_error: null })
        .eq('id', order.id);
      results.push({ orderId: order.id, status: 'success' });
    } catch (err: any) {
      await supabaseAdmin!
        .from('orders')
        .update({ shiprocket_error: err.message })
        .eq('id', order.id);
      results.push({ orderId: order.id, status: 'failed', error: err.message });
    }
  }

  return NextResponse.json({ resynced: results.length, results });
}
