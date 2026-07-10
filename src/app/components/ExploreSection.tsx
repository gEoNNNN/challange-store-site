"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimateIn, { staggerContainer, staggerItem } from "./AnimateIn";
import { useTranslations } from "../context/LanguageContext";
import styles from "./ExploreSection.module.css";

const CARDS = [
  { id: "jp", color: "#FF4F4F", badge: "JP", img: "/img/jp.png" },
  { id: "eu", color: "#8B3FD9", badge: "EU", img: "/img/eu.png" },
  { id: "kr", color: "#C9E820", badge: "KR", img: "/img/kr.png" },
  { id: "cn", color: "#2EC95C", badge: "CN", img: "/img/cn.png" },
] as const;
type CardId = typeof CARDS[number]["id"];

export default function ExploreSection() {
  const t = useTranslations();

  const CARD_TITLES: Record<CardId, string> = {
    jp: t.explore.cardJp,
    eu: t.explore.cardEu,
    kr: t.explore.cardKr,
    cn: t.explore.cardCn,
  };

  return (
    <section className={styles.section}>
      {/* Banner title */}
      <AnimateIn as="div" className={styles.titleWrap} direction="up" duration={0.6}>
        <h2 className={styles.title}>{t.explore.sectionTitle}</h2>
      </AnimateIn>

      {/* Main grid */}
      <div className={styles.grid}>
        {/* Large US card */}
        <motion.div
          className={styles.cardLarge}
          style={{ background: "#1DCFCF" }}
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.badge}>US</div>
          <p className={styles.cardTitleLarge}>
            {t.explore.cardUs.split(" ").slice(0, 1).join(" ")}<br />
            {t.explore.cardUs.split(" ").slice(1).join(" ")}
          </p>
          <div className={styles.cardImgLarge}>
            <Image
              src="/img/us.png"
              alt="Produse americane"
              fill
              sizes="500px"
              style={{ objectFit: "contain", objectPosition: "bottom right" }}
            />
          </div>
        </motion.div>

        {/* 2×2 small cards */}
        <motion.div
          className={styles.smallGrid}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.15 }}
        >
          {CARDS.map((c) => (
            <motion.div
              key={c.id}
              className={styles.cardSmall}
              style={{ background: c.color }}
              variants={staggerItem}
            >
              <div className={styles.badge}>
                {c.badge}
              </div>
              <p className={`${styles.cardTitleSmall} ${c.id === "kr" ? styles.textDark : ""}`}>
                {CARD_TITLES[c.id].split(" ").slice(0, Math.ceil(CARD_TITLES[c.id].split(" ").length / 2)).join(" ")}<br />
                {CARD_TITLES[c.id].split(" ").slice(Math.ceil(CARD_TITLES[c.id].split(" ").length / 2)).join(" ")}
              </p>
              <div className={styles.cardImgSmall}>
                <Image
                  src={c.img}
                  alt={CARD_TITLES[c.id]}
                  fill
                  sizes="220px"
                  style={{ objectFit: "contain", objectPosition: "bottom right" }}
                />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
