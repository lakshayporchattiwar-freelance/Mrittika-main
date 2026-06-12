"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import RazorpayCheckout from "@/components/RazorpayCheckout";
import type { CustomerInfo } from "@/lib/types";
import styles from "./checkout.module.css";

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

type PaymentMethod = "upi" | "cod";

export default function CheckoutPage() {
  const { items, total: cartTotal, count } = useCart();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("upi");
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
    if (!customerInfo.city.trim()) e.city = "Required";
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

  const steps = ["Shipping", "Payment", "Confirm"];

  return (
    <section className={styles.page}>
      <div className={styles.container}>
        <div className={styles.header}>
          <h1 className={styles.title}>Checkout</h1>
          <div className={styles.stepper}>
            {steps.map((label, i) => (
              <div key={label} className={styles.stepWrap}>
                <div className={styles.stepItem}>
                  <div
                    className={`${styles.stepCircle} ${
                      currentStep > i + 1
                        ? styles.stepDone
                        : currentStep === i + 1
                        ? styles.stepActive
                        : styles.stepPending
                    }`}
                  >
                    {currentStep > i + 1 ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`${styles.stepLabel} ${
                      currentStep === i + 1 ? styles.stepLabelActive : ""
                    }`}
                  >
                    {label}
                  </span>
                </div>
                {i < 2 && (
                  <div
                    className={`${styles.stepLine} ${
                      currentStep > i + 1 ? styles.stepLineDone : ""
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.main}>
            {currentStep === 1 && (
              <form onSubmit={handleStep1Submit} className={styles.card}>
                <h2 className={styles.sectionTitle}>Shipping Address</h2>
                <div className={styles.formGrid}>
                  <div className={styles.field}>
                    <label className={styles.label}>First Name *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.firstName ? styles.inputError : ""}`}
                      placeholder="Enter first name"
                      value={customerInfo.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                    />
                    {fieldErrors.firstName && <span className={styles.error}>{fieldErrors.firstName}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Last Name *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.lastName ? styles.inputError : ""}`}
                      placeholder="Enter last name"
                      value={customerInfo.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                    />
                    {fieldErrors.lastName && <span className={styles.error}>{fieldErrors.lastName}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Email *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.email ? styles.inputError : ""}`}
                      type="email"
                      placeholder="you@example.com"
                      value={customerInfo.email}
                      onChange={(e) => updateField("email", e.target.value)}
                    />
                    {fieldErrors.email && <span className={styles.error}>{fieldErrors.email}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Phone *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.phone ? styles.inputError : ""}`}
                      type="tel"
                      placeholder="10-digit mobile number"
                      value={customerInfo.phone}
                      onChange={(e) => updateField("phone", e.target.value)}
                    />
                    {fieldErrors.phone && <span className={styles.error}>{fieldErrors.phone}</span>}
                  </div>
                  <div className={`${styles.field} ${styles.fieldFull}`}>
                    <label className={styles.label}>Address *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.address ? styles.inputError : ""}`}
                      placeholder="House no., street, locality"
                      value={customerInfo.address}
                      onChange={(e) => updateField("address", e.target.value)}
                    />
                    {fieldErrors.address && <span className={styles.error}>{fieldErrors.address}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>City *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.city ? styles.inputError : ""}`}
                      placeholder="Enter city"
                      value={customerInfo.city}
                      onChange={(e) => updateField("city", e.target.value)}
                    />
                    {fieldErrors.city && <span className={styles.error}>{fieldErrors.city}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>State *</label>
                    <select
                      className={`${styles.input} ${fieldErrors.state ? styles.inputError : ""}`}
                      value={customerInfo.state}
                      onChange={(e) => updateField("state", e.target.value)}
                    >
                      <option value="">Select state</option>
                      {STATES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                    {fieldErrors.state && <span className={styles.error}>{fieldErrors.state}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>PIN Code *</label>
                    <input
                      className={`${styles.input} ${fieldErrors.pincode ? styles.inputError : ""}`}
                      placeholder="6-digit pincode"
                      value={customerInfo.pincode}
                      onChange={(e) => updateField("pincode", e.target.value)}
                    />
                    {fieldErrors.pincode && <span className={styles.error}>{fieldErrors.pincode}</span>}
                  </div>
                  <div className={styles.field}>
                    <label className={styles.label}>Country</label>
                    <input className={styles.input} value="India" readOnly />
                  </div>
                </div>
                <button type="submit" className={styles.primaryBtn}>
                  Continue to Payment
                </button>
              </form>
            )}

            {currentStep === 2 && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Payment Method</h2>

                <div className={styles.paymentOptions}>
                  <label
                    className={`${styles.paymentOption} ${
                      paymentMethod === "upi" ? styles.paymentOptionActive : ""
                    }`}
                  >
                    <div className={styles.paymentRadio}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "upi"}
                        onChange={() => setPaymentMethod("upi")}
                      />
                      <span className={styles.radioCustom} />
                    </div>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                      </div>
                      <div>
                        <span className={styles.paymentLabel}>Pay Online</span>
                        <p className={styles.paymentDesc}>UPI, Cards, Netbanking via Razorpay</p>
                      </div>
                    </div>
                    <span className={styles.paymentBadge}>Secure</span>
                  </label>

                  <label
                    className={`${styles.paymentOption} ${
                      paymentMethod === "cod" ? styles.paymentOptionActive : ""
                    }`}
                  >
                    <div className={styles.paymentRadio}>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "cod"}
                        onChange={() => setPaymentMethod("cod")}
                      />
                      <span className={styles.radioCustom} />
                    </div>
                    <div className={styles.paymentInfo}>
                      <div className={styles.paymentIcon}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23" />
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                        </svg>
                      </div>
                      <div>
                        <span className={styles.paymentLabel}>Cash on Delivery</span>
                        <p className={styles.paymentDesc}>Pay when you receive your order</p>
                      </div>
                    </div>
                    <span className={styles.paymentBadgeCod}>+₹49</span>
                  </label>
                </div>

                {error && (
                  <div className={styles.errorBanner}>{error}</div>
                )}

                <div className={styles.btnRow}>
                  {paymentMethod === "cod" ? (
                    <button
                      onClick={handleCODOrder}
                      disabled={codLoading}
                      className={styles.primaryBtn}
                    >
                      {codLoading ? "Placing Order..." : `Place COD Order — ₹${grandTotal}`}
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setError(null);
                        setCurrentStep(3);
                      }}
                      className={styles.primaryBtn}
                    >
                      Proceed to Pay ₹{grandTotal}
                    </button>
                  )}
                </div>

                <button
                  onClick={() => setCurrentStep(1)}
                  className={styles.backBtn}
                >
                  ← Back to Shipping
                </button>
              </div>
            )}

            {currentStep === 3 && (
              <div className={styles.card}>
                <h2 className={styles.sectionTitle}>Confirm & Pay</h2>

                <div className={styles.confirmBlock}>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmLabel}>Name</span>
                    <span className={styles.confirmValue}>{customerInfo.firstName} {customerInfo.lastName}</span>
                  </div>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmLabel}>Address</span>
                    <span className={styles.confirmValue}>{customerInfo.address}, {customerInfo.city}, {customerInfo.state} — {customerInfo.pincode}</span>
                  </div>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmLabel}>Phone</span>
                    <span className={styles.confirmValue}>6000386664</span>
                  </div>
                  <div className={styles.confirmRow}>
                    <span className={styles.confirmLabel}>Email</span>
                    <span className={styles.confirmValue}>mrittikaskinrituals@gmail.com</span>
                  </div>
                </div>

                <div className={styles.confirmNote}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <span>For order queries, contact us at <strong>6000386664</strong> or <strong>mrittikaskinrituals@gmail.com</strong></span>
                </div>

                <RazorpayCheckout
                  customerInfo={customerInfo}
                  total={grandTotal}
                  onSuccess={handleRazorpaySuccess}
                  onError={handleRazorpayError}
                />

                <button
                  onClick={() => setCurrentStep(2)}
                  className={styles.backBtn}
                >
                  ← Back to Payment
                </button>
              </div>
            )}
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.summaryCard}>
              <h3 className={styles.summaryTitle}>Order Summary</h3>
              <div className={styles.summaryItems}>
                {items.map((item) => (
                  <div key={item.id} className={styles.summaryItem}>
                    <span className={styles.summaryItemName}>{item.name} × {item.qty}</span>
                    <span className={styles.summaryItemPrice}>₹{item.price * item.qty}</span>
                  </div>
                ))}
              </div>
              <div className={styles.summaryDivider} />
              <div className={styles.summaryRow}>
                <span>Subtotal</span>
                <span>₹{cartTotal}</span>
              </div>
              <div className={styles.summaryRow}>
                <span>Shipping</span>
                <span className={shipping === 0 ? styles.freeShipping : ""}>
                  {shipping === 0 ? "Free" : `₹${shipping}`}
                </span>
              </div>
              {codCharge > 0 && (
                <div className={styles.summaryRow}>
                  <span>COD Charge</span>
                  <span>₹{codCharge}</span>
                </div>
              )}
              <div className={styles.summaryDivider} />
              <div className={styles.summaryTotal}>
                <span>Total</span>
                <span>₹{grandTotal}</span>
              </div>
              {shipping === 0 && (
                <div className={styles.freeShippingNote}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7a9e6e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                  Free shipping on orders above ₹499
                </div>
              )}
            </div>

            <div className={styles.trustBadges}>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span>Secure Payment</span>
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="1" y="3" width="15" height="13" />
                  <polygon points="16 8 20 8 23 11 23 16 16 16 16 8" />
                  <circle cx="5.5" cy="18.5" r="2.5" />
                  <circle cx="18.5" cy="18.5" r="2.5" />
                </svg>
                <span>Fast Delivery</span>
              </div>
              <div className={styles.trustItem}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B4513" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span>100% Authentic</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
