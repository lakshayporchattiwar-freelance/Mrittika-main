'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense, useState, useEffect } from 'react';

function TruckAnimation() {
  const [driving, setDriving] = useState(true);
  const [showDust, setShowDust] = useState(true);

  useEffect(() => {
    const driveTimer = setTimeout(() => setDriving(false), 1400);
    const dustTimer = setTimeout(() => setShowDust(false), 600);
    return () => {
      clearTimeout(driveTimer);
      clearTimeout(dustTimer);
    };
  }, []);

  return (
    <div className="relative w-full h-24 flex items-end justify-center overflow-hidden mb-4">
      <div className={`animate-truck-drive ${!driving ? 'animate-truck-bounce' : ''}`}>
        <svg width="120" height="64" viewBox="0 0 120 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect x="2" y="16" width="60" height="32" rx="4" fill="#c1622b"/>
          <rect x="4" y="20" width="24" height="18" rx="2" fill="#fdf8f2" opacity="0.85"/>
          <line x1="16" y1="20" x2="16" y2="38" stroke="#c1622b" strokeWidth="1.5" opacity="0.5"/>
          <rect x="62" y="26" width="36" height="22" rx="3" fill="#9e4c1e"/>
          <rect x="70" y="30" width="18" height="12" rx="2" fill="#fdf8f2" opacity="0.7"/>
          <rect x="2" y="46" width="96" height="4" rx="1" fill="#3b2e24" opacity="0.15"/>
          <circle cx="24" cy="52" r="8" fill="#3b2e24"/>
          <circle cx="24" cy="52" r="4" fill="#7a6b5e"/>
          <circle cx="80" cy="52" r="8" fill="#3b2e24"/>
          <circle cx="80" cy="52" r="4" fill="#7a6b5e"/>
          <circle cx="24" cy="48" r="1.5" fill="#fdf8f2" opacity="0.6"/>
          <circle cx="80" cy="48" r="1.5" fill="#fdf8f2" opacity="0.6"/>
          <path d="M96 40 L106 40 L108 44 L96 44 Z" fill="#e8a97e"/>
          <rect x="0" y="56" width="120" height="2" rx="1" fill="#ddd0bc" opacity="0.4"/>
        </svg>
      </div>
      {showDust && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 translate-y-0 ml-[-60px]">
          <svg width="30" height="20" viewBox="0 0 30 20" className="animate-dust">
            <circle cx="10" cy="12" r="4" fill="#ddd0bc" opacity="0.4"/>
            <circle cx="20" cy="10" r="3" fill="#ddd0bc" opacity="0.3"/>
            <circle cx="25" cy="14" r="2" fill="#ddd0bc" opacity="0.2"/>
          </svg>
        </div>
      )}
    </div>
  );
}

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('id') || 'MRT-XXXXXXX';

  return (
    <div className="min-h-screen bg-[#faf8f5] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center py-16">

        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce-once">
          <svg
            className="w-10 h-10 text-green-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-2xl font-semibold text-stone-800 mb-2">
          Order Placed Successfully! 🌿
        </h1>
        <p className="text-stone-500 mb-2">
          Thank you for choosing Mrittika. Your skin ritual is on its way!
        </p>

        <TruckAnimation />

        <div className="bg-white rounded-2xl border border-stone-100 shadow-sm p-6 mb-8 text-left">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-stone-500">Order ID</span>
            <span className="text-sm font-mono font-medium text-stone-800">{orderId}</span>
          </div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-stone-500">Status</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-medium">
              Order Confirmed ✓
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-500">Delivery</span>
            <span className="text-sm text-stone-700">5–7 business days</span>
          </div>
        </div>

        <p className="text-sm text-stone-400 mb-8">
          A confirmation has been noted. Track your order anytime from the Orders page.
          For help, WhatsApp us at{' '}
          <a href="https://wa.me/916000386664" className="text-[#8B4513] underline">
            6000386664
          </a>
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href={`/track?id=${orderId}`}
            className="px-6 py-3 bg-[#8B4513] text-white rounded-full text-sm font-medium hover:bg-[#7a3b10] transition"
          >
            Track Order
          </Link>
          <Link
            href="/shop"
            className="px-6 py-3 border border-stone-200 text-stone-700 rounded-full text-sm font-medium hover:bg-stone-50 transition"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#8B4513] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <OrderSuccessContent />
    </Suspense>
  );
}
