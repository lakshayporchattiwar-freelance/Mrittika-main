import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { getRazorpayInstance } from "@/lib/razorpay";
import { saveOrder } from "@/lib/orderStore";
import type { CartItem, CustomerInfo } from "@/lib/types";

export async function POST(request: Request) {
  try {
    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { amount, items, customer, paymentMethod } = body as {
      amount: number;
      items: CartItem[];
      customer: CustomerInfo;
      paymentMethod: "Prepaid" | "COD";
    };

    if (!amount || !items?.length || !customer) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const orderId = `MRT-${uuidv4().split("-")[0].toUpperCase()}`;
    const receipt = `rcpt_${orderId}`;

    const razorpay = getRazorpayInstance();

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
      notes: {
        orderId,
        customerName: `${customer.firstName} ${customer.lastName}`,
        customerEmail: customer.email,
      },
    });

    const orderRecord = {
      id: orderId,
      razorpayOrderId: razorpayOrder.id,
      items,
      customer,
      total: amount,
      paymentMethod,
      status: "Order Confirmed",
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
    const message = error instanceof Error ? error.message : "Failed to create order";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
