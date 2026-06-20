import type { Metadata } from "next";
import Script from "next/script";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { DM_Sans, Cormorant_Garamond } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";

const dmSans = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const cormorant = Cormorant_Garamond({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Mrittika — Natural Skincare Handcrafted for Indian Skin",
  description:
    "Shop Mrittika's handcrafted natural face packs — Ubtan Mix, Soft Glow, and Oil Control. Pure botanical skincare made for Indian skin. Starting at ₹119.",
  keywords:
    "natural face pack India, ubtan face pack, botanical skincare, handmade skincare India, Mrittika",
  metadataBase: new URL("https://mrittika-main.vercel.app"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.ico", type: "image/x-icon" },
    ],
    shortcut: "/favicon.ico",
    apple: "/favicon.ico",
  },
  other: {
    "msapplication-TileImage": "/favicon.ico",
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
    <html lang="en" className={`${dmSans.variable} ${cormorant.variable} antialiased`}>
      <head>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-38SPFWJ451"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-38SPFWJ451');
          `}
        </Script>
        <Script id="google-tag-manager" strategy="afterInteractive">
          {`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','GTM-WWP4K8KW');
          `}
        </Script>
      </head>
      <body className="grain-overlay">
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-WWP4K8KW"
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        {children}
        <Analytics />
        <Toaster />
      </body>
    </html>
  );
}
