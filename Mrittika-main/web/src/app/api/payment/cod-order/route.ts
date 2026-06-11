import { NextResponse } from "next/server";
import { createShiprocketOrder } from "@/lib/shiprocket";
import { saveOrder, updateOrder } from "@/lib/orderStore";
import type { CartItem, CustomerInfo, OrderRecord } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { orderData, total } = body as {
      orderData: { items: CartItem[]; customer: CustomerInfo };
      total: number;
    };

    const internalOrderId = `MRT-${Date.now()}`;

    const record: OrderRecord = {
      id: internalOrderId,
      razorpayOrderId: "",
      items: orderData.items,
      customer: orderData.customer,
      total,
      paymentMethod: "COD",
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
      console.error("Shiprocket COD order creation failed:", shiprocketError);
    }

    return NextResponse.json({ success: true, orderId: internalOrderId });
  } catch (error) {
    console.error("COD order creation failed:", error);
    return NextResponse.json(
      { success: false, error: "COD order failed" },
      { status: 500 }
    );
  }
}
