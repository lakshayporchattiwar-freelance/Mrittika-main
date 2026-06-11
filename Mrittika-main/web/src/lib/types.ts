export interface CartItem {
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

export interface OrderRecord {
  id: string;
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  shiprocketOrderId?: number;
  shiprocketShipmentId?: number;
  awbNumber?: string;
  items: CartItem[];
  customer: CustomerInfo;
  total: number;
  paymentMethod: "Prepaid" | "COD";
  status: string;
  createdAt: string;
}

export interface TrackingStatus {
  awb: string;
  currentStatus: string;
  deliveredDate?: string;
  shipmentTrackActivities: {
    date: string;
    activity: string;
    location: string;
  }[];
}
