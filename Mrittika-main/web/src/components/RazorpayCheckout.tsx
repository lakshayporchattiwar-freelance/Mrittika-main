'use client';

import { useState, useEffect } from 'react';
import Script from 'next/script';
import { useCart } from '@/context/CartContext';
import { useRouter } from 'next/navigation';
import type { CustomerInfo } from '@/lib/types';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
      on: (event: string, handler: (resp: any) => void) => void;
    };
  }
}

type RazorpayCheckoutProps = {
  customerInfo: CustomerInfo;
  total: number;
  onSuccess?: (orderId: string) => void;
  onError?: (msg: string) => void;
};

export default function RazorpayCheckout({
  customerInfo,
  total,
  onSuccess,
  onError,
}: RazorpayCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { items, clearCart } = useCart();
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).Razorpay) {
      setScriptLoaded(true);
    }
  }, []);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      setErrorMessage('Payment system is loading, please wait a moment and try again.');
      return;
    }

    if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
      setErrorMessage('Payment configuration error. Please contact support.');
      console.error('NEXT_PUBLIC_RAZORPAY_KEY_ID is not set');
      return;
    }

    setLoading(true);
    setErrorMessage('');

    const internalOrderId = `MRT-${Date.now()}`;

    try {
      const createRes = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(total * 100),
          receipt: internalOrderId,
        }),
      });

      if (!createRes.ok) {
        const errData = await createRes.json().catch(() => ({}));
        throw new Error(errData.error || `Order creation failed: ${createRes.status}`);
      }

      const { orderId: razorpayOrderId, amount } = await createRes.json();

      if (!razorpayOrderId) {
        throw new Error('No order ID received from payment server');
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: amount,
        currency: 'INR',
        name: 'Mrittika',
        description: 'Natural Skincare Ritual',
        image: '/images/mrittika-logo.png',
        order_id: razorpayOrderId,
        prefill: {
          name: `${customerInfo.firstName} ${customerInfo.lastName}`.trim(),
          email: customerInfo.email,
          contact: customerInfo.phone,
        },
        notes: {
          internal_order_id: internalOrderId,
          address: customerInfo.address,
        },
        theme: {
          color: '#8B4513',
        },
        handler: async function (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) {
          console.log('[CHECKOUT] Payment captured, verifying...', {
            order_id: response.razorpay_order_id,
            payment_id: response.razorpay_payment_id,
          });

          try {
            const verifyRes = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                internalOrderId,
                orderData: {
                  items,
                  customer: customerInfo,
                  total,
                },
              }),
            });

            const verifyData = await verifyRes.json();
            console.log('[CHECKOUT] Verify response:', verifyData);

            if (verifyData.success) {
              clearCart();
              const savedOrder = {
                id: verifyData.orderId || internalOrderId,
                razorpayOrderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                items,
                customer: customerInfo,
                total,
                paymentMethod: 'Prepaid',
                status: 'Order Confirmed',
                createdAt: new Date().toISOString(),
              };

              try {
                const existingOrders = JSON.parse(
                  localStorage.getItem('mrittika_orders') || '[]'
                );
                existingOrders.unshift(savedOrder);
                localStorage.setItem('mrittika_orders', JSON.stringify(existingOrders));
              } catch (e) {
                console.error('Failed to save order to localStorage:', e);
              }

              if (onSuccess) {
                onSuccess(verifyData.orderId || internalOrderId);
              } else {
                router.push(`/order-success?id=${verifyData.orderId || internalOrderId}`);
              }
            } else {
              throw new Error(verifyData.error || 'Payment verification failed');
            }
          } catch (verifyErr: any) {
            console.error('[CHECKOUT] Verification error:', verifyErr);
            setErrorMessage(
              `Your payment was received but order confirmation failed. ` +
              `Please contact us on WhatsApp 6000386664 with Payment ID: ${response.razorpay_payment_id}`
            );
            setLoading(false);
            if (onError) onError(verifyErr.message);
          }
        },
        modal: {
          ondismiss: function () {
            console.log('[CHECKOUT] Payment modal dismissed by user');
            setLoading(false);
          },
          confirm_close: true,
          escape: true,
        },
      };

      if (!window.Razorpay) {
        throw new Error('Payment gateway not loaded. Please refresh and try again.');
      }

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', function (response: any) {
        console.error('[CHECKOUT] Payment failed:', response.error);
        setErrorMessage(
          `Payment failed: ${response.error.description}. Please try again.`
        );
        setLoading(false);
        if (onError) onError(response.error.description);
      });

      rzp.open();

    } catch (err: any) {
      console.error('[CHECKOUT] handlePayment error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
      setLoading(false);
      if (onError) onError(err.message);
    }
  };

  return (
    <div className="w-full">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
        onLoad={() => {
          console.log('[CHECKOUT] Razorpay script loaded');
          setScriptLoaded(true);
        }}
        onError={() => {
          console.error('[CHECKOUT] Failed to load Razorpay script');
          setErrorMessage('Payment system failed to load. Please refresh and try again.');
        }}
      />

      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || !scriptLoaded}
        className={`
          w-full py-4 rounded-xl font-semibold text-white text-base
          transition-all duration-200 active:scale-95
          ${loading || !scriptLoaded
            ? 'bg-stone-300 cursor-not-allowed'
            : 'bg-[#8B4513] hover:bg-[#7a3b10] shadow-lg hover:shadow-xl'
          }
        `}
      >
        {!scriptLoaded
          ? 'Loading payment...'
          : loading
          ? 'Processing...'
          : `Pay ₹${total}`
        }
      </button>

      <p className="text-center text-xs text-stone-400 mt-3">
        🔒 Secured by Razorpay · 256-bit SSL encryption
      </p>
    </div>
  );
}
