import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { saveOrder, updateOrder } from "@/lib/orderStore";
import type { CartItem, CustomerInfo, OrderRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderData,
      internalOrderId,
    } = body as {
      razorpay_order_id: string;
      razorpay_payment_id: string;
      razorpay_signature: string;
      orderData: { items: CartItem[]; customer: CustomerInfo; total: number };
      internalOrderId: string;
    };

    const isValid = verifyRazorpaySignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: "Payment verification failed" },
        { status: 400 }
      );
    }

    const record: OrderRecord = {
      id: internalOrderId,
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      items: orderData.items,
      customer: orderData.customer,
      total: orderData.total,
      paymentMethod: "Prepaid",
      status: "Order Confirmed",
      createdAt: new Date().toISOString(),
    };

    await saveOrder(record);

    try {
      const shiprocketResult = await createShiprocketOrder(record);
      await updateOrder(internalOrderId, {
        shiprocketOrderId: shiprocketResult.shiprocketOrderId,
        shiprocketShipmentId: shiprocketResult.shipmentId,
        status: "Processing",
      });
    } catch (shiprocketError) {
      console.error(
        "Shiprocket order creation failed (payment already captured):",
        shiprocketError
      );
    }

    return NextResponse.json({ success: true, orderId: internalOrderId });
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { success: false, error: "Payment verification failed" },
      { status: 500 }
    );
  }
}
