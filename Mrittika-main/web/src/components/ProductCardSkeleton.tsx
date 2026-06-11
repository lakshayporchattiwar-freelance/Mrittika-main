import styles from "./ProductCardSkeleton.module.css";

export default function ProductCardSkeleton() {
  return (
    <div className={styles.card}>
      <div className={styles.imageSkeleton} />
      <div className={styles.body}>
        <div className={styles.lineWide} />
        <div className={styles.lineMedium} />
        <div className={styles.lineNarrow} />
        <div className={styles.actionsSkeleton}>
          <div className={styles.btnSkeleton} />
          <div className={styles.btnSkeleton} />
        </div>
      </div>
    </div>
  );
}
