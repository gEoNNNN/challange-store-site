"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BsCart3, BsList, BsX } from "react-icons/bs";
import { useCart } from "../context/CartContext";
import { useLanguage, useTranslations } from "../context/LanguageContext";
import type { Locale } from "../i18n";
import styles from "./Navbar.module.css";

const LOCALES: { code: Locale; label: string }[] = [
  { code: "ro", label: "RO" },
  { code: "ru", label: "RU" },
  { code: "en", label: "EN" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { totalItems, openDrawer } = useCart();
  const { locale, setLocale } = useLanguage();
  const t = useTranslations();

  const LINKS = [
    { href: "/",         label: t.nav.home },
    { href: "/produse",  label: t.nav.products },
    { href: "/despre",   label: t.nav.about },
    { href: "/recenzii", label: t.nav.reviews },
  ];

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
        {/* Language switcher */}
        <div className={styles.langSwitcher} role="group" aria-label="Selectează limba">
          {LOCALES.map(({ code, label }) => (
            <button
              key={code}
              className={`${styles.langBtn} ${locale === code ? styles.langBtnActive : ""}`}
              onClick={() => setLocale(code)}
            >
              {label}
            </button>
          ))}
        </div>

        <Link className={styles.navLogin} href="#login">{t.nav.login}</Link>
        <button className={styles.navCart} onClick={openDrawer} aria-label="Coș de cumpărături">
          <BsCart3 size={22} />
          {totalItems > 0 && <span className={styles.cartBadge}>{totalItems}</span>}
        </button>
        <Link className={styles.navCta} href="#contact">{t.nav.order}</Link>
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

          {/* Language switcher in mobile menu */}
          <div className={styles.mobileDivider} />
          <div className={styles.mobileLangRow}>
            {LOCALES.map(({ code, label }) => (
              <button
                key={code}
                className={`${styles.mobileLangBtn} ${locale === code ? styles.mobileLangBtnActive : ""}`}
                onClick={() => { setLocale(code); setOpen(false); }}
              >
                {label}
              </button>
            ))}
          </div>

          <div className={styles.mobileDivider} />
          <Link
            className={styles.mobileCta}
            href="#contact"
            onClick={() => setOpen(false)}
          >
            {t.nav.order}
          </Link>
        </div>
      )}
    </header>
  );
}
