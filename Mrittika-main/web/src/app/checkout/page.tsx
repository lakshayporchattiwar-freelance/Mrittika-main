"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import { ChevronDown } from "lucide-react";
import type { CustomerInfo } from "@/lib/types";

const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Lucknow",
  "Nagpur", "Indore", "Bhopal", "Patna", "Chandigarh",
  "Kochi", "Guwahati", "Bhubaneswar", "Dehradun", "Noida",
];

const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli",
  "Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh",
  "Lakshadweep", "Puducherry",
];

type PaymentMethod = "upi" | "gpay" | "cod" | "upi_id";

function SelectChevron({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--color-text-muted)]" />
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total: cartTotal, count } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
  const [upiId, setUpiId] = useState("");
  const [codLoading, setCodLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (count === 0) router.push("/shop");
  }, [count, router]);

  const shipping = cartTotal >= 499 ? 0 : 49;
  const codCharge = paymentMethod === "cod" ? 49 : 0;
  const grandTotal = cartTotal + shipping + codCharge;

  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!customerInfo.firstName.trim()) e.firstName = "Required";
    if (!customerInfo.lastName.trim()) e.lastName = "Required";
    if (!customerInfo.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerInfo.email))
      e.email = "Valid email required";
    if (!customerInfo.phone.trim() || !/^[6-9]\d{9}$/.test(customerInfo.phone.replace(/\s/g, "")))
      e.phone = "10-digit phone required";
    if (!customerInfo.address.trim()) e.address = "Required";
    if (!customerInfo.city) e.city = "Required";
    if (!customerInfo.state) e.state = "Required";
    if (!customerInfo.pincode.trim() || !/^\d{6}$/.test(customerInfo.pincode))
      e.pincode = "6-digit pincode required";
    setFieldErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleStep1Submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (validateStep1()) setCurrentStep(2);
  };

  const handleCODOrder = async () => {
    setCodLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/payment/cod-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderData: { items, customer: customerInfo },
          total: grandTotal,
        }),
      });
      const data = await res.json();
      if (data.success) {
        router.push(`/order-success?id=${data.orderId}`);
      } else {
        setError(data.error || "COD order failed");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setCodLoading(false);
    }
  };

  const handleRazorpaySuccess = (orderId: string) => {
    router.push(`/order-success?id=${orderId}`);
  };

  const handleRazorpayError = (msg: string) => {
    setError(msg);
    setCurrentStep(2);
  };

  const updateField = (field: keyof CustomerInfo, value: string) => {
    setCustomerInfo((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const copy = { ...prev };
        delete copy[field];
        return copy;
      });
    }
  };

  return (
    <section className="section py-12">
      <div className="container max-w-4xl">
        <h1 className="font-display text-3xl mb-8">Checkout</h1>

        <div className="flex items-center gap-4 mb-10">
          {["Address", "Payment", "Confirm"].map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  currentStep > i + 1
                    ? "bg-green-600 text-white"
                    : currentStep === i + 1
                    ? "bg-[#8B4513] text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep > i + 1 ? "✓" : i + 1}
              </div>
              <span
                className={`text-sm font-medium ${
                  currentStep === i + 1 ? "text-[#8B4513]" : "text-gray-400"
                }`}
              >
                {label}
              </span>
              {i < 2 && <div className="w-12 h-px bg-gray-300" />}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-3">
            {currentStep === 1 && (
              <form onSubmit={handleStep1Submit} className="space-y-4">
                <h2 className="font-display text-xl mb-4">Shipping Address</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      className="input w-full"
                      placeholder="First Name *"
                      value={customerInfo.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                    {fieldErrors.firstName && (
                      <span className="text-xs text-red-600">{fieldErrors.firstName}</span>
                    )}
                  </div>
                  <div>
                    <input
                      className="input w-full"
                      placeholder="Last Name *"
                      value={customerInfo.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                    {fieldErrors.lastName && (
                      <span className="text-xs text-red-600">{fieldErrors.lastName}</span>
                    )}
                  </div>
                </div>
                <div>
                  <input
                    className="input w-full"
                    type="email"
                    placeholder="Email *"
                    value={customerInfo.email}
                    onChange={(e) => updateField("email", e.target.value)}
                  />
                  {fieldErrors.email && (
                    <span className="text-xs text-red-600">{fieldErrors.email}</span>
                  )}
                </div>
                <div>
                  <input
                    className="input w-full"
                    type="tel"
                    placeholder="Phone (10 digits) *"
                    value={customerInfo.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                  />
                  {fieldErrors.phone && (
                    <span className="text-xs text-red-600">{fieldErrors.phone}</span>
                  )}
                </div>
                <div>
                  <input
                    className="input w-full"
                    placeholder="Address *"
                    value={customerInfo.address}
                    onChange={(e) => updateField("address", e.target.value)}
                  />
                  {fieldErrors.address && (
                    <span className="text-xs text-red-600">{fieldErrors.address}</span>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <SelectChevron>
                      <select
                        className="input w-full appearance-none pr-8"
                        value={customerInfo.city}
                        onChange={(e) => updateField("city", e.target.value)}
                      >
                        <option value="">Select City *</option>
                        {CITIES.map((c) => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                    </SelectChevron>
                    {fieldErrors.city && (
                      <span className="text-xs text-red-600">{fieldErrors.city}</span>
                    )}
                  </div>
                  <div>
                    <SelectChevron>
                      <select
                        className="input w-full appearance-none pr-8"
                        value={customerInfo.state}
                        onChange={(e) => updateField("state", e.target.value)}
                      >
                        <option value="">Select State *</option>
                        {STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </SelectChevron>
                    {fieldErrors.state && (
                      <span className="text-xs text-red-600">{fieldErrors.state}</span>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <input
                      className="input w-full"
                      placeholder="Pincode (6 digits) *"
                      value={customerInfo.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                    />
                    {fieldErrors.pincode && (
                      <span className="text-xs text-red-600">{fieldErrors.pincode}</span>
                    )}
                  </div>
                  <input
                    className="input w-full bg-gray-50"
                    value="India"
                    disabled
                  />
                </div>
                <button type="submit" className="btn btn-primary btn-lg w-full mt-4">
                  Continue to Payment
                </button>
              </form>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <h2 className="font-display text-xl mb-4">Payment Method</h2>

                {([
                  { id: "upi" as PaymentMethod, label: "UPI / Online Payment", desc: "Pay via UPI, cards, or netbanking" },
                  { id: "gpay" as PaymentMethod, label: "Google Pay", desc: "Pay using GPay UPI" },
                  { id: "cod" as PaymentMethod, label: "Cash on Delivery", desc: "₹49 COD charge applies" },
                  { id: "upi_id" as PaymentMethod, label: "Pay with any UPI ID", desc: "Enter your UPI ID" },
                ]).map((opt) => (
                  <label
                    key={opt.id}
                    className={`block border-2 rounded-lg p-4 cursor-pointer transition-colors ${
                      paymentMethod === opt.id
                        ? "border-[#8B4513] bg-[#fdf8f2]"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === opt.id}
                        onChange={() => setPaymentMethod(opt.id)}
                        className="mt-1"
                      />
                      <div>
                        <span className="font-semibold">{opt.label}</span>
                        <p className="text-sm text-[var(--color-text-muted)]">{opt.desc}</p>
                      </div>
                    </div>
                  </label>
                ))}

                {paymentMethod === "upi_id" && (
                  <input
                    className="input w-full mt-2"
                    placeholder="Enter UPI ID (e.g. name@upi)"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                  />
                )}

                {error && (
                  <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">{error}</div>
                )}

                <div className="pt-4">
                  {paymentMethod === "cod" ? (
                    <button
                      onClick={handleCODOrder}
                      disabled={codLoading}
                      className="w-full py-4 rounded-lg bg-[#8B4513] text-white font-semibold text-lg hover:bg-[#6d3510] transition-colors disabled:opacity-60"
                    >
                      {codLoading ? "Placing Order..." : `Place COD Order — ₹${grandTotal}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setError(null);
                        setCurrentStep(3);
                      }}
                      className="w-full py-4 rounded-lg bg-[#8B4513] text-white font-semibold text-lg hover:bg-[#6d3510] transition-colors"
                    >
                      Proceed to Pay ₹{grandTotal}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[#8B4513]"
                >
                  ← Back to Address
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="font-display text-xl mb-4">Confirm & Pay</h2>
                <div className="bg-[var(--color-white-warm)] rounded-lg p-6 space-y-3">
                  <p><strong>Name:</strong> {customerInfo.firstName} {customerInfo.lastName}</p>
                  <p><strong>Address:</strong> {customerInfo.address}, {customerInfo.city}, {customerInfo.state} — {customerInfo.pincode}</p>
                  <p><strong>Phone:</strong> {customerInfo.phone}</p>
                  <p><strong>Email:</strong> {customerInfo.email}</p>
                </div>

                <RazorpayCheckout
                  customerInfo={customerInfo}
                  total={grandTotal}
                  onSuccess={handleRazorpaySuccess}
                  onError={handleRazorpayError}
                />

                <button
                  onClick={() => setCurrentStep(2)}
                  className="text-sm text-[var(--color-text-muted)] hover:text-[#8B4513]"
                >
                  ← Back to Payment
                </button>
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="bg-[var(--color-cream-deep)] rounded-lg p-6 space-y-4 sticky top-24">
              <h3 className="font-display text-lg">Order Summary</h3>
              {items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span>{item.name} × {item.qty}</span>
                  <span>₹{item.price * item.qty}</span>
                </div>
              ))}
              <hr className="border-[var(--color-border-soft)]" />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Shipping</span>
                <span>{shipping === 0 ? "Free" : `₹${shipping}`}</span>
              </div>
              {codCharge > 0 && (
                <div className="flex justify-between text-sm">
                  <span>COD Charge</span>
                  <span>₹{codCharge}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
              <div className="flex gap-2 pt-2">
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">Razorpay</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">UPI</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">COD</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
