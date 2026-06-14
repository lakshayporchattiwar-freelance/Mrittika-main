let tokenCache: { value: string; expiry: number } | null = null;

export async function getShiprocketToken(): Promise<string> {
  if (tokenCache && tokenCache.expiry > Date.now()) {
    return tokenCache.value;
  }

  const email = process.env.SHIPROCKET_EMAIL;
  const password = process.env.SHIPROCKET_PASSWORD;

  if (!email || !password) {
    throw new Error('SHIPROCKET_CONFIG_ERROR: SHIPROCKET_EMAIL or SHIPROCKET_PASSWORD not set in environment variables');
  }

  const res = await fetch('https://apiv2.shiprocket.in/v1/external/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json();

  if (!res.ok || !data.token) {
    throw new Error(`SHIPROCKET_AUTH_FAILED: status=${res.status} response=${JSON.stringify(data)}`);
  }

  tokenCache = {
    value: data.token,
    expiry: Date.now() + 9 * 24 * 60 * 60 * 1000,
  };

  console.log('[SHIPROCKET] Authenticated successfully');
  return data.token;
}

export async function getPickupLocations(token: string): Promise<string[]> {
  const res = await fetch('https://apiv2.shiprocket.in/v1/external/settings/company/pickup', {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  const locations = (data?.data?.shipping_address || []).map((loc: any) => loc.pickup_location);
  console.log('[SHIPROCKET] Available pickup locations:', locations);
  return locations;
}

export async function createShiprocketOrder(order: any): Promise<{
  shiprocketOrderId: string;
  shipmentId: string;
  awbNumber?: string;
  courierName?: string;
}> {
  const token = await getShiprocketToken();

  const availablePickups = await getPickupLocations(token);
  const pickupLocationName = 'Nagpur';

  if (availablePickups.length === 0) {
    throw new Error('SHIPROCKET_NO_PICKUP_LOCATION: No pickup locations configured in your Shiprocket account. Go to Shiprocket Dashboard → Settings → Pickup Addresses → Add New Pickup Location.');
  }

  if (!availablePickups.includes(pickupLocationName)) {
    throw new Error(`SHIPROCKET_PICKUP_MISMATCH: pickup_location "${pickupLocationName}" does not exist in your Shiprocket account. Available pickup locations are: [${availablePickups.join(', ')}]. Update the pickupLocationName variable in /lib/shiprocket.ts to match one of these exactly, or rename your pickup address in Shiprocket Dashboard → Settings → Pickup Addresses to "Nagpur".`);
  }

  const customerName = `${order.customer.firstName} ${order.customer.lastName}`.trim();

  if (!order.items || order.items.length === 0) {
    throw new Error('SHIPROCKET_NO_ITEMS: order.items array is empty, cannot create shipment');
  }

  if (!order.customer.pincode || order.customer.pincode.length !== 6) {
    throw new Error(`SHIPROCKET_INVALID_PINCODE: "${order.customer.pincode}" is not a valid 6-digit pincode`);
  }

  if (!order.customer.phone || order.customer.phone.replace(/\D/g, '').length < 10) {
    throw new Error(`SHIPROCKET_INVALID_PHONE: "${order.customer.phone}" is not a valid 10-digit phone number`);
  }

  const payload = {
    order_id: order.id,
    order_date: new Date().toISOString().slice(0, 16).replace('T', ' '),
    pickup_location: pickupLocationName,
    channel_id: '',
    comment: 'Mrittika Natural Skincare Order',
    billing_customer_name: order.customer.firstName || customerName || 'Customer',
    billing_last_name: order.customer.lastName || '',
    billing_address: order.customer.address,
    billing_address_2: '',
    billing_city: order.customer.city,
    billing_pincode: String(order.customer.pincode).replace(/\D/g, ''),
    billing_state: order.customer.state,
    billing_country: 'India',
    billing_email: order.customer.email,
    billing_phone: String(order.customer.phone).replace(/\D/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: order.items.map((item: any) => ({
      name: item.name,
      sku: item.slug || item.id || 'SKU-DEFAULT',
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
    weight: order.items.reduce((sum: number, item: any) => sum + (0.25 * item.qty), 0) || 0.25,
  };

  console.log('[SHIPROCKET] Sending payload:', JSON.stringify(payload, null, 2));

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
  console.log('[SHIPROCKET] Response status:', createRes.status);
  console.log('[SHIPROCKET] Response body:', JSON.stringify(createData, null, 2));

  if (!createRes.ok) {
    if (createRes.status === 422 && createData.errors) {
      const fieldErrors = Object.entries(createData.errors)
        .map(([field, msgs]: [string, any]) => `${field}: ${Array.isArray(msgs) ? msgs.join(', ') : msgs}`)
        .join(' | ');
      throw new Error(`SHIPROCKET_VALIDATION_ERROR: ${fieldErrors}`);
    }
    if (createRes.status === 401 || createRes.status === 403) {
      throw new Error(`SHIPROCKET_AUTH_ERROR: status=${createRes.status} — token may be expired or account access issue. Response: ${JSON.stringify(createData)}`);
    }
    throw new Error(`SHIPROCKET_API_ERROR: status=${createRes.status} response=${JSON.stringify(createData)}`);
  }

  if (!createData.order_id) {
    throw new Error(`SHIPROCKET_NO_ORDER_ID: order created but no order_id returned. Full response: ${JSON.stringify(createData)}`);
  }

  if (createData.status_code && createData.status_code !== 1 && createData.status_code !== 200) {
    throw new Error(`SHIPROCKET_REJECTED: status_code=${createData.status_code} message=${createData.message || 'unknown'}`);
  }

  const shiprocketOrderId = String(createData.order_id);
  const shipmentId = String(createData.shipment_id);

  console.log('[SHIPROCKET] Order created successfully:', shiprocketOrderId, 'shipment:', shipmentId);

  let awbNumber: string | undefined;
  let courierName: string | undefined;

  try {
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const awbRes = await fetch(
      'https://apiv2.shiprocket.in/v1/external/courier/assign/awb',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ shipment_id: shipmentId }),
      }
    );

    const awbData = await awbRes.json();
    console.log('[SHIPROCKET] AWB response:', JSON.stringify(awbData, null, 2));

    if (awbData.response?.data?.awb_code) {
      awbNumber = awbData.response.data.awb_code;
      courierName = awbData.response.data.courier_name;
      console.log('[SHIPROCKET] AWB assigned:', awbNumber, 'via', courierName);
    } else if (awbData.message) {
      console.warn('[SHIPROCKET] AWB not assigned yet:', awbData.message, '— order still created successfully, AWB can be assigned manually from Shiprocket dashboard');
    }
  } catch (awbError: any) {
    console.error('[SHIPROCKET] AWB assignment failed (non-blocking):', awbError.message);
  }

  if (awbNumber) {
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
      console.log('[SHIPROCKET] Pickup response:', JSON.stringify(pickupData, null, 2));
    } catch (pickupError: any) {
      console.error('[SHIPROCKET] Pickup scheduling failed (non-blocking):', pickupError.message);
    }
  } else {
    console.log('[SHIPROCKET] Skipping pickup generation — no AWB assigned yet');
  }

  return { shiprocketOrderId, shipmentId, awbNumber, courierName };
}

export async function trackShiprocketOrder(awb: string): Promise<any> {
  const token = await getShiprocketToken();

  const res = await fetch(
    `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${awb}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  const data = await res.json();
  return data.tracking_data || null;
}
