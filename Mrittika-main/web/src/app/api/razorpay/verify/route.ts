import { NextResponse } from "next/server";
import { verifyRazorpaySignature } from "@/lib/razorpay";
import { getOrderByRazorpayOrderId, updateOrder } from "@/lib/orderStore";
import { createShiprocketOrder } from "@/lib/shiprocket";

export async function POST(request: Request) {
  try {
    if (!process.env.RAZORPAY_KEY_SECRET) {
      return NextResponse.json({ error: "Razorpay not configured" }, { status: 500 });
    }

    const body = await request.json();
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body as {
      razorpayOrderId: string;
      razorpayPaymentId: string;
      razorpaySignature: string;
    };

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return NextResponse.json({ error: "Missing payment details" }, { status: 400 });
    }

    const isValid = verifyRazorpaySignature(
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature
    );

    if (!isValid) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const order = await getOrderByRazorpayOrderId(razorpayOrderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    await updateOrder(order.id, {
      razorpayPaymentId,
      status: "Payment Verified",
    });

    try {
      const shiprocketResult = await createShiprocketOrder(order);
      await updateOrder(order.id, {
        shiprocketOrderId: shiprocketResult.shiprocketOrderId,
        shiprocketShipmentId: shiprocketResult.shipmentId,
        status: "Processing",
      });
    } catch (shiprocketError) {
      console.error("Shiprocket order creation failed (payment still verified):", shiprocketError);
      await updateOrder(order.id, { status: "Payment Verified" });
    }

    return NextResponse.json({
      success: true,
      orderId: order.id,
      status: "Payment Verified",
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verification failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
