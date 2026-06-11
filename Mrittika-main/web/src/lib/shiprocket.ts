import type { OrderRecord, TrackingStatus } from "@/lib/types";

let tokenCache: { value: string; expiry: number } | null = null;

export async function getShiprocketToken(): Promise<string> {
  if (tokenCache !== null && tokenCache.expiry > Date.now()) {
    return tokenCache.value;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error("Shiprocket credentials not configured");
  }

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.token) {
    throw new Error("Failed to authenticate with Shiprocket");
  }

  tokenCache = {
    value: data.token,
    expiry: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  return tokenCache.value;
}

export async function createShiprocketOrder(
  order: OrderRecord
): Promise<{ shiprocketOrderId: number; shipmentId: number }> {
  const token = await getShiprocketToken();

  const body = {
    order_id: order.id,
    order_date: new Date().toISOString().slice(0, 16).replace("T", " "),
    pickup_location: "Nagpur",
    billing_customer_name: order.customer.firstName,
    billing_last_name: order.customer.lastName,
    billing_address: order.customer.address,
    billing_city: order.customer.city,
    billing_pincode: Number(order.customer.pincode),
    billing_state: order.customer.state,
    billing_country: "India",
    billing_email: order.customer.email,
    billing_phone: order.customer.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item) => ({
      name: item.name,
      sku: item.slug,
      units: item.qty,
      selling_price: item.price,
      discount: "",
      tax: "",
    })),
    payment_method: order.paymentMethod,
    sub_total: order.total,
    length: 12,
    breadth: 12,
    height: 6,
    weight: 0.25,
  };

  const res = await fetch("https://apiv2.shiprocket.in/v1/external/orders/create/adhoc", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const data = await res.json();

  return {
    shiprocketOrderId: data.order_id,
    shipmentId: data.shipment_id,
  };
}

export async function trackShiprocketOrder(awb: string): Promise<TrackingStatus> {
  const token = await getShiprocketToken();

  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  const trackingData = data.tracking_data ?? data;

  return {
    awb: trackingData.awb_code ?? awb,
    currentStatus: trackingData.current_status ?? trackingData.status ?? "Unknown",
    deliveredDate: trackingData.delivered_date ?? undefined,
    shipmentTrackActivities: (
      trackingData.shipment_track_activities ?? []
    ).map(
      (a: { date: string; activity: string; location: string }) => ({
        date: a.date ?? "",
        activity: a.activity ?? "",
        location: a.location ?? "",
      })
    ),
  };
}
