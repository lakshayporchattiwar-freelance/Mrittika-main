"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { CartItem } from "@/lib/types";

export type AppliedCoupon = {
  code: string;
  discountAmount: number;
  message: string;
};

type CartContextType = {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  count: number;
  mounted: boolean;
  appliedCoupon: AppliedCoupon | null;
  setAppliedCoupon: (coupon: AppliedCoupon | null) => void;
};

const CartContext = createContext<CartContextType>(null!);

export function useCart(): CartContextType {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}

const STORAGE_KEY = "mrittika_cart";
const COUPON_KEY = "mrittika_coupon";

function readStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return [];
}

function readCouponStorage(): AppliedCoupon | null {
  try {
    const stored = localStorage.getItem(COUPON_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return null;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCouponState] = useState<AppliedCoupon | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setItems(readStorage());
    setAppliedCouponState(readCouponStorage());
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, mounted]);

  useEffect(() => {
    if (mounted) {
      if (appliedCoupon) {
        localStorage.setItem(COUPON_KEY, JSON.stringify(appliedCoupon));
      } else {
        localStorage.removeItem(COUPON_KEY);
      }
    }
  }, [appliedCoupon, mounted]);

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [...prev, item];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQty = useCallback((id: string, qty: number) => {
    if (qty < 1) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
    setAppliedCouponState(null);
  }, []);

  const setAppliedCoupon = useCallback((coupon: AppliedCoupon | null) => {
    setAppliedCouponState(coupon);
  }, []);

  const total = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const count = items.reduce((sum, i) => sum + i.qty, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQty, clearCart, total, count, mounted, appliedCoupon, setAppliedCoupon }}
    >
      {children}
    </CartContext.Provider>
  );
}
