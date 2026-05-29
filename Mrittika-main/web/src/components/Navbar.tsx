"use client";

import Link from "next/link";
import { useState } from "react";
import styles from "./Navbar.module.css";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

type NavbarProps = {
  cartCount?: number;
};

export default function Navbar({ cartCount = 0 }: NavbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className={styles.header}>
      <div className={`container ${styles.navbar}`}>
        <Link href="/" className={styles.logo}>
          Mrittika<span>.</span>
        </Link>

        <nav className={styles.links} aria-label="Primary">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className={styles.link}>
              {link.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button className={styles.iconButton} aria-label="Search">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="11" cy="11" r="7" strokeWidth="1.5" />
              <path d="M20 20L16.5 16.5" strokeWidth="1.5" />
            </svg>
          </button>
          <Link href="/cart" className={styles.iconButton} aria-label="Cart">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M6 7h12l-1.2 10.4a2 2 0 0 1-2 1.6H9.2a2 2 0 0 1-2-1.6L6 7Z"
                strokeWidth="1.5"
              />
              <path d="M9 9V6a3 3 0 0 1 6 0v3" strokeWidth="1.5" />
            </svg>
            {cartCount > 0 && <span className={styles.badge}>{cartCount}</span>}
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
        </nav>
        <Link href="/shop" className="btn btn-primary btn-lg">
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
  );
}
