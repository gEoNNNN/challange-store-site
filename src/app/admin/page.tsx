import Link from "next/link";
import { BsArrowLeft } from "react-icons/bs";
import styles from "./admin.module.css";

export default function AdminHome() {
  return (
    <div>
      <h1 className={styles.title}>Panou administrativ</h1>
      <p style={{ color: "#6b7280", marginTop: 8 }}>
        Alege o secțiune: produse (imagine, descriere, preț) sau imagini.
      </p>
      <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
        <Link href="/admin/products" className={styles.searchBtn}>Produse</Link>
        <Link href="/" className={styles.logout}>
          <BsArrowLeft size={14} /> Înapoi pe site
        </Link>
      </div>
    </div>
  );
}
