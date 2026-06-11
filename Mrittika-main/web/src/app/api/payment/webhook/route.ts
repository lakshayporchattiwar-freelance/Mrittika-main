import { NextResponse } from "next/server";
import crypto from "crypto";
import { updateOrder, getOrderByRazorpayOrderId } from "@/lib/orderStore";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Razorpay-Signature");

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Razorpay webhook: missing secret");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature && expectedSig !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;

    if (event === "payment.captured") {
      const payment = body.payload?.payment?.entity;
      if (payment) {
        const razorpayOrderId = payment.order_id;
        const order = await getOrderByRazorpayOrderId(razorpayOrderId);
        if (order && order.status === "Order Confirmed") {
          await updateOrder(order.id, {
            razorpayPaymentId: payment.id,
            status: "Order Confirmed",
          });
        }
      }
    } else if (event === "payment.failed") {
      const payment = body.payload?.payment?.entity;
      console.error(
        `Razorpay payment failed: order_id=${payment?.order_id}, payment_id=${payment?.id}`
      );
    } else if (event === "order.paid") {
      const orderEntity = body.payload?.order?.entity;
      if (orderEntity) {
        const razorpayOrderId = orderEntity.id;
        const order = await getOrderByRazorpayOrderId(razorpayOrderId);
        if (order) {
          await updateOrder(order.id, { status: "Order Confirmed" });
        }
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
