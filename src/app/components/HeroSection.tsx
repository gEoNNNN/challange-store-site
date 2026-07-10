"use client";
import Image from "next/image";
import { useTranslations } from "../context/LanguageContext";
import styles from "../page.module.css";

export default function HeroSection() {
  const t = useTranslations();
  return (
    <section className={styles.hero}>
      <div className={styles.heroLeft}>
        <h1>
          {t.hero.titleLine1}<br />
          <span className={styles.accent}>{t.hero.titleLine2}</span>
          <br />
          {t.hero.titleLine3}
        </h1>
        <p>{t.hero.desc}</p>
        <div className={styles.heroBtns}>
          <a className={styles.btnPrimary} href="#produse">{t.hero.ctaBuy}</a>
          <a className={styles.btnSecondary} href="#produse">{t.hero.ctaView}</a>
        </div>
      </div>
      <div className={styles.heroRight}>
        <div className={styles.aura} aria-hidden="true" />
        <Image
          src="/img/candypack.png"
          alt="Pachet cu bomboane importate"
          width={900}
          height={900}
          className={styles.candyImg}
          priority
        />
      </div>
    </section>
  );
}
