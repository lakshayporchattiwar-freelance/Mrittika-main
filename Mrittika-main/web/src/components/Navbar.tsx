"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getWishlistCount } from "@/lib/wishlist";
import SearchOverlay from "@/components/SearchOverlay";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const accountLinks = [
  { href: "/orders", label: "My Orders" },
  { href: "/wishlist", label: "Wishlist" },
  { href: "/track", label: "Track Order" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [accountOpen, setAccountOpen] = useState(false);
  const { count } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const sync = () => setWishlistCount(getWishlistCount());
    sync();
    window.addEventListener("wishlist-updated", sync);
    return () => window.removeEventListener("wishlist-updated", sync);
  }, []);

  return (
    <>
      <header className={`${styles.header} ${scrolled ? styles.scrolled : ""}`}>
        <div className={`container ${styles.glassBar}`}>
          <Link href="/" className={styles.logo}>
            <Image src="/images/mrittika-logo.png" alt="Mrittika" width={120} height={40} className={styles.logoImage} priority />
          </Link>

          <nav className={styles.links} aria-label="Primary">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={styles.link}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            <button className={styles.iconButton} aria-label="Search" onClick={() => setSearchOpen(true)}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
                <path d="M20 20L16.5 16.5" strokeWidth="1.5" />
              </svg>
            </button>
            <div className={styles.accountWrap}>
              <button className={styles.iconButton} aria-label="Account" onClick={() => setAccountOpen((prev) => !prev)}>
                <svg viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" strokeWidth="1.5" fill="none" />
                  <circle cx="12" cy="7" r="4" strokeWidth="1.5" fill="none" />
                </svg>
              </button>
              {accountOpen && (
                <div className={styles.accountDropdown}>
                  {accountLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={styles.accountLink}
                      onClick={() => setAccountOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
            <Link href="/wishlist" className={styles.iconButton} aria-label="Wishlist">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" strokeWidth="1.5" fill="none" />
              </svg>
              {wishlistCount > 0 && <span className={styles.badge}>{wishlistCount}</span>}
            </Link>
            <Link href="/orders" className={styles.iconButton} aria-label="My Orders" title="My Orders">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M16.5 9.4 7.55 4.24M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" strokeWidth="1.5" fill="none" />
                <polyline points="3.29 7 12 12 20.71 7" strokeWidth="1.5" fill="none" />
                <line x1="12" y1="22" x2="12" y2="12" strokeWidth="1.5" />
              </svg>
            </Link>
            <Link href="/cart" className={styles.iconButton} aria-label="Cart">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path
                  d="M6 7h12l-1.2 10.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 7Z"
                  strokeWidth="1.5"
                />
                <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeWidth="1.5" />
              </svg>
              {count > 0 && <span className={styles.badge}>{count}</span>}
            </Link>
            <button
              className={styles.menuButton}
              aria-label="Open menu"
              onClick={() => setOpen((prev) => !prev)}
            >
              <span />
              <span />
              <span />
            </button>
          </div>
        </div>

        <div className={`${styles.drawer} ${open ? styles.drawerOpen : ""}`}>
          <div className={styles.drawerHeader}>
            <span className={styles.drawerTitle}>Menu</span>
            <button
              className={styles.drawerClose}
              onClick={() => setOpen(false)}
              aria-label="Close menu"
            >
              ×
            </button>
          </div>
          <nav className={styles.drawerLinks} aria-label="Mobile">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={styles.drawerLink}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/wishlist"
              className={styles.drawerLink}
              onClick={() => setOpen(false)}
            >
              Wishlist {wishlistCount > 0 ? `(${wishlistCount})` : ""}
            </Link>
            <Link
              href="/orders"
              className={styles.drawerLink}
              onClick={() => setOpen(false)}
            >
              My Orders
            </Link>
            <Link
              href="/track"
              className={styles.drawerLink}
              onClick={() => setOpen(false)}
            >
              Track Order
            </Link>
          </nav>
          <Link href="/shop" className="btn btn-primary btn-lg" onClick={() => setOpen(false)}>
            Shop Now
          </Link>
        </div>
        {open && (
          <button
            className={styles.backdrop}
            aria-label="Close menu"
            onClick={() => setOpen(false)}
          />
        )}
      </header>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
