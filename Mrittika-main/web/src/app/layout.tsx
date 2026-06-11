import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export const metadata: Metadata = {
  title: "Mrittika — Natural Skincare Handcrafted for Indian Skin",
  description:
    "Shop Mrittika's handcrafted natural face packs — Ubtan Mix, Soft Glow, and Oil Control. Pure botanical skincare made for Indian skin. Starting at ₹119.",
  keywords:
    "natural face pack India, ubtan face pack, botanical skincare, handmade skincare India, Mrittika",
  metadataBase: new URL("https://mrittika-main.vercel.app"),
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  openGraph: {
    title: "Mrittika — Natural Skincare Handcrafted for Indian Skin",
    description:
      "Pure botanical skincare made with 100% natural ingredients, formulated for Indian skin tones and climate.",
    url: "https://mrittika-main.vercel.app",
    siteName: "Mrittika",
    images: [
      {
        url: "https://mrittika-main.vercel.app/images/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Mrittika Natural Skincare",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mrittika — Natural Skincare Handcrafted for Indian Skin",
    description: "Pure botanical skincare made for Indian skin.",
    images: ["https://mrittika-main.vercel.app/images/og-image.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="grain-overlay">
        <link rel="preload" href="/frames/webp_frame_0001.webp" as="image" />
        <link rel="preload" href="/frames/webp_frame_0002.webp" as="image" />
        <link rel="preload" href="/frames/webp_frame_0003.webp" as="image" />
        <link rel="preload" href="/frames/webp_frame_0004.webp" as="image" />
        <link rel="preload" href="/frames/webp_frame_0005.webp" as="image" />
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <CartProvider>
          <Navbar />
          <main id="main" className="animate-page-in">{children}</main>
        </CartProvider>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
