import { NextResponse } from "next/server";
import { getOrderById } from "@/lib/orderStore";
import { trackShiprocketOrder } from "@/lib/shiprocket";
import type { TrackingStatus } from "@/lib/types";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get("orderId");

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const order = await getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const result: { order: typeof order; tracking?: TrackingStatus } = { order };

    if (order.awbNumber) {
      try {
        result.tracking = await trackShiprocketOrder(order.awbNumber);
      } catch {
        result.tracking = undefined;
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Tracking failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
