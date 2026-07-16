import { requireAdmin } from './supabase';

export interface OrderItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  qty: number;
  image: string;
}

export interface CustomerInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
}

export interface CancellationRecord {
  orderId: string;
  reason: string;
  requestedAt: string;
  status: 'Pending' | 'Approved' | 'Refund Initiated' | 'Refunded' | 'Rejected';
  refundId?: string;
  refundAmount?: number;
}

export interface OrderRecord {
  id: string;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  paymentMethod: string;
  items: OrderItem[];
  customer: CustomerInfo;
  total: number;
  subtotal?: number;
  shippingCharge?: number;
  couponCode?: string | null;
  discountAmount?: number;
  status: string;
  shiprocketOrderId?: string;
  shiprocketShipmentId?: string;
  awbNumber?: string;
  courierName?: string;
  createdAt: string;
  cancellation?: CancellationRecord;
  cancelledAt?: string;
  cancellationReason?: string;
  refundId?: string;
  refundStatus?: string;
  refundAmount?: number;
  shiprocketCancelStatus?: string;
}

function rowToOrderRecord(order: any): OrderRecord {
  return {
    id: order.id,
    razorpayOrderId: order.razorpay_order_id,
    razorpayPaymentId: order.razorpay_payment_id,
    paymentMethod: order.payment_method,
    items: (order.order_items || []).map((item: any) => ({
      id: item.id,
      name: item.product_name,
      slug: item.product_slug,
      price: item.unit_price,
      qty: item.quantity,
      image: item.image_url || `/images/products/${item.product_slug}.webp`,
    })),
    customer: {
      firstName: (order.customer_name || '').split(' ')[0] || '',
      lastName: (order.customer_name || '').split(' ').slice(1).join(' ') || '',
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.shipping_address,
      city: order.shipping_city,
      state: order.shipping_state,
      pincode: order.shipping_pincode,
      country: order.shipping_country || 'India',
    },
    total: order.total,
    couponCode: order.coupon_code || undefined,
    discountAmount: order.discount_amount || undefined,
    status: order.status,
    shiprocketOrderId: order.shiprocket_order_id,
    shiprocketShipmentId: order.shiprocket_shipment_id,
    awbNumber: order.awb_number,
    courierName: order.courier_name,
    createdAt: order.created_at,
    cancellation: order.cancellation || undefined,
    cancelledAt: order.cancelled_at || undefined,
    cancellationReason: order.cancellation_reason || undefined,
    refundId: order.refund_id || undefined,
    refundStatus: order.refund_status || undefined,
    refundAmount: order.refund_amount || undefined,
    shiprocketCancelStatus: order.shiprocket_cancel_status || undefined,
  };
}

export async function saveOrder(order: OrderRecord): Promise<void> {
  const customerName = `${order.customer?.firstName || ''} ${order.customer?.lastName || ''}`.trim() || 'Customer';

  const itemsSubtotal = (order.items || []).reduce((sum, item) => sum + ((item.price || 0) * (item.qty || 0)), 0);
  const shippingCharge = order.shippingCharge ?? (itemsSubtotal >= 499 ? 0 : 49);
  const codCharge = order.paymentMethod === 'COD' ? 49 : 0;
  const discountAmt = order.discountAmount || 0;
  const finalTotal = order.total || (itemsSubtotal - discountAmt + shippingCharge + codCharge);

  console.log('[ORDER-STORE] Saving order:', {
    id: order.id,
    paymentMethod: order.paymentMethod,
    itemsSubtotal,
    shippingCharge,
    codCharge,
    discountAmt,
    finalTotal,
    customer: customerName,
    email: order.customer?.email,
  });

  const { error: orderError } = await requireAdmin()
    .from('orders')
    .insert({
      id: order.id,
      razorpay_order_id: order.razorpayOrderId || null,
      razorpay_payment_id: order.razorpayPaymentId || null,
      payment_method: order.paymentMethod,
      status: order.status,
      subtotal: itemsSubtotal,
      shipping_charge: shippingCharge,
      cod_charge: codCharge,
      discount_amount: discountAmt,
      total: finalTotal,
      coupon_code: order.couponCode || null,
      customer_name: customerName,
      customer_email: order.customer?.email || '',
      customer_phone: order.customer?.phone || '',
      shipping_address: order.customer?.address || '',
      shipping_city: order.customer?.city || '',
      shipping_state: order.customer?.state || '',
      shipping_pincode: order.customer?.pincode || '',
      shipping_country: order.customer?.country || 'India',
      created_at: order.createdAt,
      updated_at: new Date().toISOString(),
    });

  if (orderError) {
    console.error('[ORDER-STORE] Failed to save order to Supabase:', orderError);
    throw new Error(`Failed to save order: ${orderError.message}`);
  }

  const orderItemsRows = order.items.map((item) => ({
    order_id: order.id,
    product_name: item.name,
    product_slug: item.slug,
    quantity: item.qty,
    unit_price: item.price,
    total_price: item.price * item.qty,
    image_url: item.image,
  }));

  const { error: itemsError } = await requireAdmin()
    .from('order_items')
    .insert(orderItemsRows);

  if (itemsError) {
    console.error('[ORDER-STORE] Failed to save order items:', itemsError);
  }

  console.log('[ORDER-STORE] Order saved to Supabase:', order.id);
}

export async function getOrderById(id: string): Promise<OrderRecord | null> {
  const { data: order, error } = await requireAdmin()
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();

  if (error || !order) return null;

  return rowToOrderRecord(order);
}

export async function updateOrder(
  id: string,
  updates: Partial<{
    status: string;
    shiprocketOrderId: string;
    shiprocketShipmentId: string;
    awbNumber: string;
    courierName: string;
    cancellation: CancellationRecord;
    cancelledAt: string;
    razorpayPaymentId: string;
  }>
): Promise<void> {
  const dbUpdates: any = { updated_at: new Date().toISOString() };
  if (updates.status) dbUpdates.status = updates.status;
  if (updates.shiprocketOrderId) dbUpdates.shiprocket_order_id = updates.shiprocketOrderId;
  if (updates.shiprocketShipmentId) dbUpdates.shiprocket_shipment_id = updates.shiprocketShipmentId;
  if (updates.awbNumber) dbUpdates.awb_number = updates.awbNumber;
  if (updates.courierName) dbUpdates.courier_name = updates.courierName;
  if (updates.cancellation) dbUpdates.cancellation = updates.cancellation;
  if (updates.cancelledAt) dbUpdates.cancelled_at = updates.cancelledAt;
  if (updates.razorpayPaymentId) dbUpdates.razorpay_payment_id = updates.razorpayPaymentId;

  const { error } = await requireAdmin()
    .from('orders')
    .update(dbUpdates)
    .eq('id', id);

  if (error) console.error('[ORDER-STORE] Failed to update order:', error);
}

export async function getOrdersByEmail(email: string): Promise<OrderRecord[]> {
  const { data: orders, error } = await requireAdmin()
    .from('orders')
    .select('*, order_items(*)')
    .eq('customer_email', email)
    .order('created_at', { ascending: false });

  if (error || !orders) return [];
  return orders.map(rowToOrderRecord);
}

export async function getAllOrders(): Promise<OrderRecord[]> {
  const { data: orders, error } = await requireAdmin()
    .from('orders')
    .select('*, order_items(*)')
    .order('created_at', { ascending: false });

  if (error || !orders) return [];
  return orders.map(rowToOrderRecord);
}

export async function getOrderByRazorpayOrderId(
  razorpayOrderId: string
): Promise<OrderRecord | null> {
  const { data: order, error } = await requireAdmin()
    .from('orders')
    .select('*, order_items(*)')
    .eq('razorpay_order_id', razorpayOrderId)
    .single();

  if (error || !order) return null;
  return rowToOrderRecord(order);
}

export async function getOrderByRazorpayPaymentId(
  razorpayPaymentId: string
): Promise<OrderRecord | null> {
  const { data: order, error } = await requireAdmin()
    .from('orders')
    .select('*, order_items(*)')
    .eq('razorpay_payment_id', razorpayPaymentId)
    .single();

  if (error || !order) return null;
  return rowToOrderRecord(order);
}
