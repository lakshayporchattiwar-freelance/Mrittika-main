let tokenCache: { value: string; expiry: number } | null = null;

export async function getShiprocketToken(): Promise<string> {
  if (tokenCache && tokenCache.expiry > Date.now()) {
    return tokenCache.value;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured');
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!data.token) {
    throw new Error(`Shiprocket auth failed: ${JSON.stringify(data)}`);
  }

  tokenCache = {
    value: data.token,
    expiry: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  console.log('[SHIPROCKET] Authenticated successfully');
  return data.token;
}

export async function createShiprocketOrder(order: any): Promise<{
  shiprocketOrderId: string;
  shipmentId: string;
  awbNumber?: string;
  courierName?: string;
}> {
  const token = await getShiprocketToken();

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();

  const payload = {
    order_id: order.id,
    order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    pickup_location: 'Nagpur',
    channel_id: '',
    comment: 'Mrittika Natural Skincare Order',
    billing_customer_name: order.customer.firstName || customerName,
    billing_last_name: order.customer.lastName || '',
    billing_address: order.customer.address,
    billing_address_2: '',
    billing_city: order.customer.city,
    billing_pincode: order.customer.pincode,
    billing_state: order.customer.state,
    billing_country: 'India',
    billing_email: order.customer.email,
    billing_phone: order.customer.phone,
    shipping_is_billing: true,
    order_items: order.items.map((item: any) => ({
      name: item.name,
      sku: item.slug,
      units: item.qty,
      selling_price: String(item.price),
      discount: '',
      tax: '',
      hsn: 33049900,
    })),
    payment_method: order.paymentMethod === 'COD' ? 'COD' : 'Prepaid',
    shipping_charges: 0,
    giftwrap_charges: 0,
    transaction_charges: order.paymentMethod === 'COD' ? 49 : 0,
    total_discount: 0,
    sub_total: order.total,
    length: 12,
    breadth: 12,
    height: 6,
    weight: order.items.reduce((sum: number, item: any) => sum + (0.25 * item.qty), 0),
  };

  console.log('[SHIPROCKET] Creating order:', order.id);

  const createRes = await fetch(
    'https://apiv2.shiprocket.in/v1/external/orders/create/adhoc',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    }
  );

  const createData = await createRes.json();
  console.log('[SHIPROCKET] Order creation response:', JSON.stringify(createData));

  if (!createData.order_id) {
    throw new Error(`Shiprocket order creation failed: ${JSON.stringify(createData)}`);
  }

  const shiprocketOrderId = String(createData.order_id);
  const shipmentId = String(createData.shipment_id);

  let awbNumber: string | undefined;
  let courierName: string | undefined;

  try {
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const awbRes = await fetch(
      'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          shipment_id: shipmentId,
          courier_id: '',
        }),
      }
    );

    const awbData = await awbRes.json();
    console.log('[SHIPROCKET] AWB response:', JSON.stringify(awbData));

    if (awbData.response?.data?.awb_code) {
      awbNumber = awbData.response.data.awb_code;
      courierName = awbData.response.data.courier_name;
      console.log('[SHIPROCKET] AWB assigned:', awbNumber, 'via', courierName);
    }
  } catch (awbError) {
    console.error('[SHIPROCKET] AWB assignment failed (non-blocking):', awbError);
  }

  try {
    const pickupRes = await fetch(
      'https://apiv2.shiprocket.in/v1/external/courier/generate/pickup',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: [shipmentId] }),
      }
    );
    const pickupData = await pickupRes.json();
    console.log('[SHIPROCKET] Pickup scheduled:', JSON.stringify(pickupData));
  } catch (pickupError) {
    console.error('[SHIPROCKET] Pickup scheduling failed (non-blocking):', pickupError);
  }

  return { shiprocketOrderId, shipmentId, awbNumber, courierName };
}

export async function trackShiprocketOrder(awb: string): Promise<any> {
  const token = await getShiprocketToken();

  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  const data = await res.json();
  return data.tracking_data || null;
}
