import { NextResponse } from "next/server";
import { getOrderById, updateOrder } from "@/lib/orderStore";
import { getRazorpayInstance } from "@/lib/razorpay";
import { getShiprocketToken } from "@/lib/shiprocket";
import type { CancellationRecord } from "@/lib/types";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { reason } = await request.json() as { reason: string };

    if (!reason) {
      return NextResponse.json(
        { success: false, error: "Reason is required" },
        { status: 400 }
      );
    }

    const order = await getOrderById(id);
    if (!order) {
      return NextResponse.json(
        { success: false, error: "Order not found" },
        { status: 404 }
      );
    }

    const hoursSinceOrder =
      (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceOrder > 24) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Cancellation window has closed. Orders can only be cancelled within 24 hours of placement. Contact us on WhatsApp 6000386664 for help.",
        },
        { status: 400 }
      );
    }

    if (
      order.status === "Delivered" ||
      order.status === "Out for Delivery" ||
      order.status === "Cancelled"
    ) {
      return NextResponse.json(
        { success: false, error: "Order cannot be cancelled at this stage" },
        { status: 400 }
      );
    }

    if (order.status === "Shipped") {
      return NextResponse.json(
        {
          success: false,
          error:
            "Order has already been shipped. Please refuse delivery or contact support on WhatsApp 6000386664.",
        },
        { status: 400 }
      );
    }

    if (order.shiprocketOrderId) {
      try {
        const token = await getShiprocketToken();
        await fetch("https://apiv2.shiprocket.in/v1/external/orders/cancel", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ ids: [order.shiprocketOrderId] }),
        });
      } catch (shiprocketError) {
        console.error("Shiprocket cancellation failed (continuing anyway):", shiprocketError);
      }
    }

    let refundInitiated = false;
    let refundId: string | undefined;
    let cancellationStatus: CancellationRecord["status"] = "Pending";

    if (order.paymentMethod === "Prepaid" && order.razorpayPaymentId) {
      try {
        const razorpay = getRazorpayInstance();
        const refund = await razorpay.payments.refund(
          order.razorpayPaymentId,
          {
            amount: order.total * 100,
            speed: "normal",
            notes: { reason, orderId: id },
          }
        );
        refundId = refund.id as string;
        refundInitiated = true;
        cancellationStatus = "Refund Initiated";
      } catch (refundError) {
        console.error("Razorpay refund failed (manual review needed):", refundError);
        cancellationStatus = "Pending";
      }
    }

    const cancellation: CancellationRecord = {
      orderId: id,
      reason,
      requestedAt: new Date().toISOString(),
      status: cancellationStatus,
      refundId,
      refundAmount: order.total,
    };

    await updateOrder(id, {
      status: "Cancelled",
      cancelledAt: new Date().toISOString(),
      cancellation,
    });

    const isPrepaid = order.paymentMethod === "Prepaid";

    return NextResponse.json({
      success: true,
      message: isPrepaid
        ? `Order cancelled. Refund of ₹${order.total} will be credited in 5-7 business days.`
        : "Order cancelled successfully.",
      cancellation,
    });
  } catch (error) {
    console.error("Order cancellation error:", error);
    return NextResponse.json(
      { success: false, error: "Cancellation failed. Contact support." },
      { status: 500 }
    );
  }
}
