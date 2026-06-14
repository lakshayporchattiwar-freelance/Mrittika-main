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
