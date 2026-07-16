import { NextResponse } from "next/server";
import { updateOrder, getOrderByRazorpayOrderId, getOrderByRazorpayPaymentId } from "@/lib/orderStore";
import { requireAdmin } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("X-Razorpay-Signature");

    const secret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      console.error("Razorpay webhook: missing secret");
      return NextResponse.json({ error: "Not configured" }, { status: 500 });
    }

    const crypto = await import("crypto");
    const expectedSig = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    if (signature && expectedSig !== signature) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const body = JSON.parse(rawBody);
    const event = body.event;
    const payload = body.payload;

    console.log("[WEBHOOK] Received event:", event);

    if (event === "payment.captured") {
      const payment = payload?.payment?.entity;
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
      const payment = payload?.payment?.entity;
      console.error(
        `Razorpay payment failed: order_id=${payment?.order_id}, payment_id=${payment?.id}`
      );
    } else if (event === "order.paid") {
      const orderEntity = payload?.order?.entity;
      if (orderEntity) {
        const razorpayOrderId = orderEntity.id;
        const order = await getOrderByRazorpayOrderId(razorpayOrderId);
        if (order) {
          await updateOrder(order.id, { status: "Order Confirmed" });
        }
      }
    } else if (event === "refund.processed") {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;
      const refundId = refundEntity?.id;

      console.log("[WEBHOOK] Refund processed:", refundId, "for payment:", paymentId);

      if (paymentId) {
        const { error } = await requireAdmin()
          .from("orders")
          .update({ refund_status: "processed" })
          .eq("razorpay_payment_id", paymentId);

        if (error) {
          console.error("[WEBHOOK] Failed to update refund status:", error);
        }

        const order = await getOrderByRazorpayPaymentId(paymentId);
        if (order && order.cancellation) {
          await updateOrder(order.id, {
            cancellation: {
              ...order.cancellation,
              status: "Refunded",
              refundId: refundEntity?.id,
            },
          });
        }
      }
    } else if (event === "refund.failed") {
      const refundEntity = payload?.refund?.entity;
      const paymentId = refundEntity?.payment_id;

      console.error("[WEBHOOK] Refund failed for payment:", paymentId);

      if (paymentId) {
        await requireAdmin()
          .from("orders")
          .update({ refund_status: "failed" })
          .eq("razorpay_payment_id", paymentId);
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error);
    return NextResponse.json({ received: true });
  }
}
