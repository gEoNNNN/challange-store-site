"use client";
import { useState } from "react";
import Image from "next/image";
import { BsCart3, BsList, BsX } from "react-icons/bs";
import styles from "../page.module.css";

const LINKS = [
  { href: "/", label: "Acasă" },
  { href: "/produse", label: "Produse" },
  { href: "/despre", label: "Despre noi" },
  { href: "/recenzii", label: "Recenzii" },
];

export default function HomeNav() {
  const [open, setOpen] = useState(false);
  return (
    <header className={styles.nav}>
      <div className={styles.navLogo}>
        <Image
          src="/img/logo.jpg"
          alt="Challenge Store logo"
          width={140}
          height={48}
          className={styles.navLogoImg}
          priority
        />
      </div>
      <nav className={styles.navLinks}>
        <a href="/" className={styles.navLinkActive}>Acasă</a>
        <a href="/produse">Produse</a>
        <a href="/despre">Despre noi</a>
        <a href="/recenzii">Recenzii</a>
      </nav>
      <div className={styles.navActions}>
        <a className={styles.navLogin} href="#login">Log in</a>
        <a className={styles.navCart} href="#cos" aria-label="Coș de cumpărături">
          <BsCart3 size={22} />
        </a>
        <a className={styles.navCta} href="#contact">Comandă</a>
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
          {LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={l.href === "/" ? styles.mobileLinkActive : styles.mobileLink}
              onClick={() => setOpen(false)}
            >
              {l.label}
            </a>
          ))}
          <div className={styles.mobileDivider} />
          <a className={styles.mobileCta} href="#contact" onClick={() => setOpen(false)}>
            Comandă acum
          </a>
        </div>
      )}
    </header>
  );
}
