import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";

export default function ShopLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <CartProvider>
      <Navbar />
      <main id="main" className="animate-page-in">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        {children}
      </main>
      <Footer />
    </CartProvider>
  );
}
