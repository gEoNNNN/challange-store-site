"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsBoxSeam, BsImage, BsTag } from "react-icons/bs";
import styles from "./admin.module.css";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    fetch("/api/admin/products?limit=1")
      .then((response) => setAuthorized(response.status !== 401))
      .catch(() => setAuthorized(false));
  }, []);

  return (
    <div className={styles.shell}>
      {authorized === true && (
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
      )}
      <div className={styles.content}>{children}</div>
    </div>
  );
}
