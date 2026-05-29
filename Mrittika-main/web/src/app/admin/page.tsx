"use client";

import { useEffect, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase, supabaseConfigError } from "@/lib/supabaseClient";
import styles from "./admin.module.css";

type Product = {
  id: string;
  name: string;
  price: number;
  mrp: number;
};

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, current) =>
      setSession(current)
    );
    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    const fetchProducts = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/admin/products`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );
      if (!response.ok) return;
      const data = await response.json();
      setProducts(data);
    };
    fetchProducts();
  }, [session]);

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (!supabase) {
      setError("Supabase env vars are missing");
      return;
    }
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (signInError) {
      setError(signInError.message);
    }
  };

  if (!supabase) {
    return (
      <section className={`section ${styles.admin}`}>
        <div className="container">
          <div className={styles.login}>
            <h1>Admin Login</h1>
            <p className="text-muted">{supabaseConfigError}</p>
          </div>
        </div>
      </section>
    );
  }

  if (!session) {
    return (
      <section className={`section ${styles.admin}`}>
        <div className="container">
          <form className={styles.login} onSubmit={handleLogin}>
            <h1>Admin Login</h1>
            <p className="text-muted">Sign in to manage products and orders.</p>
            <input
              className="input"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <input
              className="input"
              type="password"
              placeholder="Password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
            {error && <p className={styles.error}>{error}</p>}
            <button className="btn btn-primary" type="submit">
              Sign In
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className={`section ${styles.admin}`}>
      <div className="container">
        <div className={styles.header}>
          <h1>Admin Dashboard</h1>
          <button
            className="btn btn-ghost"
            onClick={() => supabase?.auth.signOut()}
          >
            Sign Out
          </button>
        </div>

        <div className={styles.table}>
          <div className={styles.tableRow}>
            <span>Name</span>
            <span>Price</span>
            <span>MRP</span>
          </div>
          {products.map((product) => (
            <div key={product.id} className={styles.tableRow}>
              <span>{product.name}</span>
              <span>₹{product.price}</span>
              <span>₹{product.mrp}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
