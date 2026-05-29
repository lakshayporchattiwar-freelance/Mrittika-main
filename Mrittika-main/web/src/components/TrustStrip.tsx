import styles from "./TrustStrip.module.css";

const items = [
  { icon: "🌿", label: "100% Natural Ingredients" },
  { icon: "✦", label: "Handcrafted in Small Batches" },
  { icon: "🇮🇳", label: "Made for Indian Skin" },
  { icon: "🧪", label: "Dermatologist Tested" },
  { icon: "💚", label: "Vegan & Cruelty-Free" },
];

export default function TrustStrip() {
  return (
    <div className={styles.strip}>
      <div className={`container ${styles.items}`}>
        {items.map((item) => (
          <div key={item.label} className={styles.item}>
            <span className={styles.icon}>{item.icon}</span>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
