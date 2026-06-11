"use client";

import { useState } from "react";
import type { CustomerInfo } from "@/lib/types";

type CheckoutFormProps = {
  onSubmit: (customer: CustomerInfo, paymentMethod: "Prepaid" | "COD") => void;
  placing: boolean;
};

export default function CheckoutForm({ onSubmit, placing }: CheckoutFormProps) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country] = useState("India");
  const [paymentMethod, setPaymentMethod] = useState<"Prepaid" | "COD">("Prepaid");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Valid email is required";
    if (!phone.trim() || !/^[6-9]\d{9}$/.test(phone.replace(/\s/g, ""))) e.phone = "Valid 10-digit phone is required";
    if (!address.trim()) e.address = "Address is required";
    if (!city.trim()) e.city = "City is required";
    if (!state.trim()) e.state = "State is required";
    if (!pincode.trim() || !/^\d{6}$/.test(pincode)) e.pincode = "Valid 6-digit pincode is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(
      { firstName, lastName, email, phone, address, city, state, pincode, country },
      paymentMethod
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className="input"
              placeholder="First name *"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
            {errors.firstName && <span className="text-xs text-[var(--color-primary)]">{errors.firstName}</span>}
          </div>
          <div>
            <input
              className="input"
              placeholder="Last name *"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
            {errors.lastName && <span className="text-xs text-[var(--color-primary)]">{errors.lastName}</span>}
          </div>
        </div>
        <div>
          <input
            className="input"
            type="email"
            placeholder="Email address *"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          {errors.email && <span className="text-xs text-[var(--color-primary)]">{errors.email}</span>}
        </div>
        <div>
          <input
            className="input"
            type="tel"
            placeholder="Phone number *"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          {errors.phone && <span className="text-xs text-[var(--color-primary)]">{errors.phone}</span>}
        </div>
        <div>
          <input
            className="input"
            placeholder="Address *"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />
          {errors.address && <span className="text-xs text-[var(--color-primary)]">{errors.address}</span>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className="input"
              placeholder="City *"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
            {errors.city && <span className="text-xs text-[var(--color-primary)]">{errors.city}</span>}
          </div>
          <div>
            <input
              className="input"
              placeholder="State *"
              value={state}
              onChange={(e) => setState(e.target.value)}
            />
            {errors.state && <span className="text-xs text-[var(--color-primary)]">{errors.state}</span>}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <input
              className="input"
              placeholder="PIN code *"
              value={pincode}
              onChange={(e) => setPincode(e.target.value)}
            />
            {errors.pincode && <span className="text-xs text-[var(--color-primary)]">{errors.pincode}</span>}
          </div>
          <input className="input" placeholder="Country" value={country} readOnly />
        </div>
      </div>

      <div className="mt-6">
        <h3 className="font-semibold mb-3">Payment Method</h3>
        <div className="grid gap-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "Prepaid"}
              onChange={() => setPaymentMethod("Prepaid")}
            />
            Pay Online (Razorpay)
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "COD"}
              onChange={() => setPaymentMethod("COD")}
            />
            Cash on Delivery
          </label>
        </div>
      </div>

      <button
        type="submit"
        className="btn btn-primary btn-lg w-full mt-6"
        disabled={placing}
      >
        {placing ? "Placing Order..." : paymentMethod === "COD" ? "Place Order (COD)" : "Pay with Razorpay"}
      </button>
    </form>
  );
}
