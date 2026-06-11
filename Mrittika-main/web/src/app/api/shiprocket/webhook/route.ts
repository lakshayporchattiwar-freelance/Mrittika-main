import { NextResponse } from "next/server";
import { updateOrder } from "@/lib/orderStore";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { shipment_id, order_id, awb, current_status } = body as {
      shipment_id?: number;
      order_id?: string;
      awb?: string;
      current_status?: string;
    };

    if (!order_id && !shipment_id) {
      return NextResponse.json({ error: "Missing order identifier" }, { status: 400 });
    }

    const statusMap: Record<string, string> = {
      NEW: "Processing",
      PICKUP_SCHEDULED: "Processing",
      PICKUP_RESCHEDULED: "Processing",
      PICKUP_CANCELLED: "Processing",
      IN_TRANSIT: "Shipped",
      OUT_FOR_DELIVERY: "Out for Delivery",
      DELIVERED: "Delivered",
      CANCELLED: "Cancelled",
      RTO: "Return Initiated",
      RTO_DELIVERED: "Returned",
    };

    const mappedStatus = current_status ? (statusMap[current_status] ?? current_status) : undefined;

    const updates: Partial<import("@/lib/types").OrderRecord> = {};
    if (awb) updates.awbNumber = awb;
    if (mappedStatus) updates.status = mappedStatus;

    if (order_id) {
      await updateOrder(order_id, updates);
    } else {
      console.log(`Shiprocket webhook for shipment ${shipment_id}: status=${current_status}, awb=${awb}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
