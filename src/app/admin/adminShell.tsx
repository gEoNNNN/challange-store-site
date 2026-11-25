"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsBoxSeam, BsImage, BsTag } from "react-icons/bs";
import styles from "./admin.module.css";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className={styles.shell}>
      <nav className={styles.nav}>
        <Link href="/admin/products" className={styles.navBrand}>
          <BsBoxSeam size={18} /> Admin
        </Link>
        <Link href="/admin/products" className={`${styles.navLink} ${pathname?.startsWith("/admin/products") ? styles.navLinkActive : ""}`}>
          <BsBoxSeam size={15} /> Produse
        </Link>
        <Link href="/admin/images" className={`${styles.navLink} ${pathname?.startsWith("/admin/images") ? styles.navLinkActive : ""}`}>
          <BsImage size={15} /> Imagini
        </Link>
        <Link href="/produse" className={styles.navLink}>
          <BsTag size={15} /> Site
        </Link>
      </nav>
      <div className={styles.content}>{children}</div>
    </div>
  );
}
