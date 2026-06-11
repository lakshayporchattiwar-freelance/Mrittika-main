import { NextResponse } from "next/server";
import { trackShiprocketOrder } from "@/lib/shiprocket";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const awb = searchParams.get("awb");

    if (!awb) {
      return NextResponse.json(
        { error: "Missing AWB number" },
        { status: 400 }
      );
    }

    const tracking = await trackShiprocketOrder(awb);
    return NextResponse.json(tracking);
  } catch (error) {
    console.error("Tracking error:", error);
    return NextResponse.json({
      awb: "",
      currentStatus: "Tracking unavailable, contact support",
      shipmentTrackActivities: [],
    });
  }
}
