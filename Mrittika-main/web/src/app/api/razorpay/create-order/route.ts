import { NextRequest, NextResponse } from 'next/server';
import { saveOrder, updateOrder } from '@/lib/orderStore';
import { createShiprocketOrder } from '@/lib/shiprocket';
import { sendOrderConfirmationEmail } from '@/lib/notifications';
import Razorpay from 'razorpay';
import type { OrderItem, CustomerInfo } from '@/lib/orderStore';

export async function POST(req: NextRequest) {
  console.log('[RAZORPAY-CREATE] Starting order creation');

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[RAZORPAY-CREATE] Missing Razorpay credentials');
    return NextResponse.json({ error: 'Razorpay not configured' }, { status: 500 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { amount, items, customer, paymentMethod } = body as {
    amount: number;
    items: OrderItem[];
    customer: CustomerInfo;
    paymentMethod: 'Prepaid' | 'COD';
  };

  if (!amount || !items?.length || !customer) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const orderId = `MRT-${Date.now()}`;
    const receipt = `rcpt_${orderId}`;

    const razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret });

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: 'INR',
      receipt,
      notes: {
        orderId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
      },
    });

    console.log('[RAZORPAY-CREATE] Order created:', razorpayOrder.id);

    const orderRecord = {
      id: orderId,
      razorpayOrderId: razorpayOrder.id,
      paymentMethod: paymentMethod || 'Prepaid',
      items,
      customer,
      total: amount,
      status: 'Order Confirmed',
      createdAt: new Date().toISOString(),
    };

    await saveOrder(orderRecord);

    try {
      const shiprocketResult = await createShiprocketOrder(orderRecord);
      await updateOrder(orderId, {
        status: 'Processing',
        shiprocketOrderId: shiprocketResult.shiprocketOrderId,
        shiprocketShipmentId: shiprocketResult.shipmentId,
        awbNumber: shiprocketResult.awbNumber,
        courierName: shiprocketResult.courierName,
      });
    } catch (shiprocketError) {
      console.error('[RAZORPAY-CREATE] Shiprocket failed (non-blocking):', shiprocketError);
    }

    sendOrderConfirmationEmail(orderRecord).catch((err) =>
      console.error('[RAZORPAY-CREATE] Email send failed (non-blocking):', err)
    );

    return NextResponse.json({
      orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to create order';
    console.error('[RAZORPAY-CREATE] Error:', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
