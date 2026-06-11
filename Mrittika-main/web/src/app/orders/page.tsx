"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Package } from "lucide-react";
import { getOrders, statusColors, type Order } from "@/lib/orders";
import styles from "./orders.module.css";

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <section className={`section ${styles.orders}`}>
        <div className="container">
          <h1>My Orders</h1>
          <p className={styles.loading}>Loading orders...</p>
        </div>
      </section>
    );
  }

  return (
    <section className={`section ${styles.orders}`}>
      <div className="container">
        <h1>My Orders</h1>

        {orders.length === 0 ? (
          <div className={styles.empty}>
            <Package size={48} className={styles.emptyIcon} />
            <p>No orders yet</p>
            <Link href="/shop" className="btn btn-primary btn-lg">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className={styles.list}>
            {orders.map((order) => (
              <div key={order.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div>
                    <span className={styles.orderId}>{order.id}</span>
                    <span className={styles.orderDate}>{order.date}</span>
                  </div>
                  <span
                    className={styles.statusBadge}
                    style={{ background: statusColors[order.status] }}
                  >
                    {order.status}
                  </span>
                </div>
                <div className={styles.items}>
                  {order.items.map((item, i) => (
                    <div key={i} className={styles.item}>
                      <div className={styles.itemImageWrap}>
                        <Image src={item.image} alt={item.name} fill className={styles.itemImage} sizes="56px" />
                      </div>
                      <div className={styles.itemInfo}>
                        <span className={styles.itemName}>{item.name}</span>
                        <span className={styles.itemMeta}>₹{item.price} × {item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.total}>Total: ₹{order.total}</span>
                  <Link href={`/track?id=${order.id}`} className={styles.trackBtn}>
                    Track Order
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
