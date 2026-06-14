import { NextRequest, NextResponse } from 'next/server';
import { getOrderById } from '@/lib/orderStore';
import { trackShiprocketOrder } from '@/lib/shiprocket';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get('orderId');
  const awb = searchParams.get('awb');

  if (!orderId && !awb) {
    return NextResponse.json({ error: 'orderId or awb required' }, { status: 400 });
  }

  let trackingAwb = awb;

  if (orderId && !trackingAwb) {
    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    if (!order.awbNumber) {
      return NextResponse.json({
        status: order.status,
        message: 'Your order is confirmed and awaiting pickup. Tracking will be available once the courier picks up your order.',
        orderId,
      });
    }
    trackingAwb = order.awbNumber;
  }

  try {
    const trackingData = await trackShiprocketOrder(trackingAwb!);
    return NextResponse.json({ success: true, trackingData, awb: trackingAwb });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: 'Tracking unavailable. Contact support at 6000386664.',
    }, { status: 500 });
  }
}
