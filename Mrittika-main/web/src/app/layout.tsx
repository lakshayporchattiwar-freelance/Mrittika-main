import type { Metadata } from "next";
import { Caveat, Cormorant_Garamond, DM_Sans } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-body",
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-accent",
});

export const metadata: Metadata = {
  title: "Mrittika — Natural Skincare Handcrafted for Indian Skin",
  description:
    "Pure botanical skincare made with 100% natural ingredients, formulated for Indian skin tones and climate.",
  metadataBase: new URL("https://mrittika.example"),
  openGraph: {
    title: "Mrittika — Natural Skincare Handcrafted for Indian Skin",
    description:
      "Pure botanical skincare made with 100% natural ingredients, formulated for Indian skin tones and climate.",
    images: ["/images/og-mrittika.svg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${dmSans.variable} ${caveat.variable}`}
    >
      <body className="grain-overlay">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <Navbar />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
