"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsCart3, BsList, BsX } from "react-icons/bs";
import styles from "./Navbar.module.css";

const LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Produse" },
  { href: "/despre", label: "Despre noi" },
  { href: "/recenzii", label: "Recenzii" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.nav}>
      <div className={styles.navLogo}>
        <Link href="/" onClick={() => setOpen(false)}>
          <Image
            src="/img/logo.jpg"
            alt="Challenge Store logo"
            width={140}
            height={48}
            className={styles.navLogoImg}
            priority
          />
        </Link>
      </div>
      <nav className={styles.navLinks}>
        {LINKS.map((l) => {
          const active =
            l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              className={active ? styles.navLinkActive : styles.navLink}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
      <div className={styles.navActions}>
        <Link className={styles.navLogin} href="#login">Log in</Link>
        <Link className={styles.navCart} href="#cos" aria-label="Coș de cumpărături">
          <BsCart3 size={22} />
        </Link>
        <Link className={styles.navCta} href="#contact">Comandă</Link>
        <button
          className={styles.hamburger}
          onClick={() => setOpen(!open)}
          aria-label="Meniu"
          aria-expanded={open}
        >
          {open ? <BsX size={26} /> : <BsList size={26} />}
        </button>
      </div>
      {open && (
        <div className={styles.mobileMenu}>
          {LINKS.map((l) => {
            const active =
              l.href === "/" ? pathname === "/" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                className={active ? styles.mobileLinkActive : styles.mobileLink}
                onClick={() => setOpen(false)}
              >
                {l.label}
              </Link>
            );
          })}
          <div className={styles.mobileDivider} />
          <Link
            className={styles.mobileCta}
            href="#contact"
            onClick={() => setOpen(false)}
          >
            Comandă acum
          </Link>
        </div>
      )}
    </header>
  );
}
