'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Search, X, ChevronRight } from 'lucide-react';
import styles from './orders.module.css';

interface OrderItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  qty: number;
  image: string;
}

interface Order {
  id: string;
  paymentMethod: string;
  items: OrderItem[];
  total: number;
  status: string;
  awbNumber?: string;
  cancellationReason?: string;
  refundStatus?: string;
  refundAmount?: number;
  createdAt: string;
}

const CANCEL_REASONS = [
  "Ordered by mistake",
  "Found a better price elsewhere",
  "Delivery taking too long",
  "Want to change delivery address",
  "Other",
];

const STATUS_CLASS: Record<string, string> = {
  'Order Confirmed': styles.statusConfirmed,
  'Processing': styles.statusProcessing,
  'Shipped': styles.statusShipped,
  'Out for Delivery': styles.statusOutForDelivery,
  'Delivered': styles.statusDelivered,
  'Cancelled': styles.statusCancelled,
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState<string | null>(null);
  const [emailInput, setEmailInput] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [cancelModal, setCancelModal] = useState<Order | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [cancelModalMessage, setCancelModalMessage] = useState<string | null>(null);
  const [cancelModalSuccess, setCancelModalSuccess] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedEmail = localStorage.getItem('mrittika_customer_email');
      if (storedEmail) {
        setEmail(storedEmail);
        fetchOrders(storedEmail);
      } else {
        setLoading(false);
      }
    } catch (e) {
      console.error('Failed to read stored email:', e);
      setLoading(false);
    }
  }, []);

  async function fetchOrders(emailToFetch: string) {
    setLoading(true);
    setLookupError('');
    try {
      const res = await fetch(`/api/orders?email=${encodeURIComponent(emailToFetch)}`);
      const data = await res.json();

      if (!res.ok) {
        setLookupError(data.error || 'Could not fetch orders.');
        setOrders([]);
      } else {
        setOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Failed to fetch orders:', err);
      setLookupError('Something went wrong. Please try again.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }

  function handleLookup(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = emailInput.trim().toLowerCase();
    if (!trimmed || !trimmed.includes('@')) {
      setLookupError('Please enter a valid email address.');
      return;
    }
    try {
      localStorage.setItem('mrittika_customer_email', trimmed);
    } catch (e) {
      console.error('Failed to save email:', e);
    }
    setEmail(trimmed);
    fetchOrders(trimmed);
  }

  const openCancelModal = (order: Order) => {
    setCancelModal(order);
    setCancelReason('');
    setCustomReason('');
    setCancelError(null);
    setCancelModalMessage(null);
    setCancelModalSuccess(false);
  };

  const closeCancelModal = () => {
    setCancelModal(null);
    setCancelError(null);
    setCancelModalMessage(null);
    setCancelModalSuccess(false);
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    const reason = cancelReason === 'Other' ? customReason : cancelReason;
    if (!reason.trim()) {
      setCancelError('Please select or enter a reason.');
      return;
    }

    setCancelling(true);
    setCancelError(null);

    try {
      const res = await fetch(`/api/orders/${cancelModal.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();

      if (data.success) {
        setOrders((prev) =>
          prev.map((o) =>
            o.id === cancelModal.id
              ? { ...o, status: 'Cancelled', cancellationReason: reason }
              : o
          )
        );
        setCancelModalMessage(data.message);
        setCancelModalSuccess(true);
      } else {
        setCancelModalMessage(data.error || 'Cancellation failed. Please try again.');
        setCancelModalSuccess(false);
      }
    } catch {
      setCancelModalMessage('Something went wrong. Please try again or contact support.');
      setCancelModalSuccess(false);
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <section className={styles.orders}>
        <div className={styles.loading}>
          {[1, 2, 3].map((i) => (
            <div key={i} className={styles.skeleton}>
              <div className={styles.skeletonLine} style={{ height: '1rem', width: '33%' }} />
              <div className={styles.skeletonLine} style={{ height: '0.75rem', width: '50%' }} />
              <div className={styles.skeletonLine} style={{ height: '0.75rem', width: '25%' }} />
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (!email) {
    return (
      <div className={styles.lookupWrap}>
        <div className={styles.lookupCard}>
          <Package className={styles.lookupIcon} size={48} strokeWidth={1.2} />
          <h1 className={styles.lookupTitle}>Find Your Orders</h1>
          <p className={styles.lookupDesc}>
            Enter the email address you used when placing your order to view your order history.
          </p>
          <form onSubmit={handleLookup} className={styles.lookupForm}>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              placeholder="you@example.com"
              className="input"
            />
            {lookupError && (
              <p className={styles.lookupError}>{lookupError}</p>
            )}
            <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
              <Search size={16} />
              View My Orders
            </button>
          </form>
          <Link href="/shop" className={styles.lookupLink}>
            Continue Shopping
          </Link>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className={styles.lookupWrap}>
        <div className={styles.lookupCard}>
          <Package className={styles.lookupIcon} size={48} strokeWidth={1.2} />
          <h1 className={styles.lookupTitle}>No Orders Yet</h1>
          <p className={styles.lookupDesc}>
            We couldn&apos;t find any orders for {email}. Your orders will appear here once you&apos;ve made a purchase.
          </p>
          <Link href="/shop" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <section className={styles.orders}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1>My Orders</h1>
          <span className={styles.count}>({orders.length})</span>
        </div>
        <span className={styles.emailLabel}>{email}</span>
      </div>

      <div className={styles.list}>
        {orders.map((order) => (
          <div key={order.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <div>
                <span className={styles.orderId}>{order.id}</span>
                <span className={styles.orderDate}>
                  {new Date(order.createdAt).toLocaleDateString('en-IN', {
                    day: 'numeric', month: 'long', year: 'numeric',
                  })}
                </span>
              </div>
              <span className={`${styles.statusBadge} ${STATUS_CLASS[order.status] || styles.statusConfirmed}`}>
                {order.status}
              </span>
            </div>

            <div className={styles.items}>
              {order.items.map((item) => (
                <div key={item.id} className={styles.item}>
                  <span className={styles.itemName}>{item.name} × {item.qty}</span>
                  <span className={styles.itemPrice}>₹{item.price * item.qty}</span>
                </div>
              ))}
            </div>

            <div className={styles.cardFooter}>
              <div className={styles.footerLeft}>
                <span className={styles.total}>Total: ₹{order.total}</span>
                {(order.status === 'Order Confirmed' || order.status === 'Processing') && (
                  <button
                    onClick={() => openCancelModal(order)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                )}
              </div>
              <Link href={`/track?id=${order.id}`} className={styles.trackLink}>
                Track Order <ChevronRight size={14} />
              </Link>
            </div>

            {order.status === 'Cancelled' && order.cancellationReason && (
              <div className={styles.cancelledInfo}>
                Cancelled: {order.cancellationReason}
                {order.refundStatus && order.paymentMethod === 'Prepaid' && (
                  <span> — Refund {order.refundStatus} (₹{order.refundAmount})</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {cancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <button onClick={closeCancelModal} className={styles.modalClose}>
              <X size={18} />
            </button>

            <h2 className={styles.modalTitle}>Cancel Order #{cancelModal.id}</h2>

            <label className={styles.modalLabel}>Reason for cancellation</label>
            <select
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className={styles.modalSelect}
            >
              <option value="">Select a reason</option>
              {CANCEL_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>

            {cancelReason === 'Other' && (
              <textarea
                rows={3}
                placeholder="Please tell us why..."
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className={styles.modalTextarea}
              />
            )}

            {cancelError && (
              <p className={styles.modalError}>{cancelError}</p>
            )}

            {cancelModalMessage && (
              <div className={`${styles.modalMessage} ${cancelModalSuccess ? styles.modalMessageSuccess : styles.modalMessageError}`}>
                {cancelModalMessage}
              </div>
            )}

            {!cancelModalMessage && (
              <div className={styles.modalActions}>
                <button onClick={closeCancelModal} className={styles.keepBtn}>
                  Keep Order
                </button>
                <button onClick={handleCancel} disabled={cancelling} className={styles.confirmCancelBtn}>
                  {cancelling ? 'Cancelling...' : 'Yes, Cancel Order'}
                </button>
              </div>
            )}

            {cancelModalMessage && (
              <div className={styles.modalActions}>
                <button onClick={closeCancelModal} className={styles.closeBtn}>
                  Close
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
