import { getShopProducts } from "@/lib/shopProducts";
import ShopClient from "@/components/ShopClient";
import styles from "./shop.module.css";

export default async function ShopPage() {
  const products = await getShopProducts();

  return (
    <section className={`section ${styles.shop}`}>
      <div className="container">
        <div className={styles.header}>
          <h1>Shop</h1>
          <p className="text-muted">Handcrafted skincare for every skin type</p>
        </div>

        <ShopClient products={products} />
      </div>
    </section>
  );
}
