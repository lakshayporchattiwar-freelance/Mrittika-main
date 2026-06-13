import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { saveOrder } from '@/lib/orderStore';
import Razorpay from 'razorpay';
import type { CartItem, CustomerInfo } from '@/lib/types';

export async function POST(req: NextRequest) {
  console.log('[RAZORPAY-CREATE] Starting order creation');

  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    console.error('[RAZORPAY-CREATE] Missing Razorpay credentials:', {
      hasKeyId: !!keyId,
      hasKeySecret: !!keySecret,
    });
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
    items: CartItem[];
    customer: CustomerInfo;
    paymentMethod: 'Prepaid' | 'COD';
  };

  if (!amount || !items?.length || !customer) {
    console.error('[RAZORPAY-CREATE] Missing required fields');
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  try {
    const orderId = `MRT-${uuidv4().split('-')[0].toUpperCase()}`;
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
      items,
      customer,
      total: amount,
      paymentMethod,
      status: 'Order Confirmed',
      createdAt: new Date().toISOString(),
    };

    await saveOrder(orderRecord);

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
