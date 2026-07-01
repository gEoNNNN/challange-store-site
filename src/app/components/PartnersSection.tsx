"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import AnimateIn, { staggerContainer, staggerItem } from "./AnimateIn";
import CountUp from "./CountUp";
import styles from "./PartnersSection.module.css";

const PARTNERS = [
  { id: 1, src: "/img/partener1.png", name: "Partener 1" },
  { id: 2, src: "/img/partener2.jpg", name: "Partener 2" },
  { id: 3, src: "/img/partener3.png", name: "Partener 3" },
  { id: 4, src: "/img/partener4.png", name: "Partener 4" },
  { id: 5, src: "/img/partener5.png", name: "Partener 5" },
  { id: 6, src: "/img/partener6.png", name: "Partener 6" },
];

export default function PartnersSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        {/* Heading */}
        <AnimateIn as="div" className={styles.heading} direction="up" duration={0.7}>
          <span className={styles.label}>Colaborăm cu cele mai mari branduri</span>
          <h2 className={styles.title}>Branduri <span className={styles.accent}>Partenere</span></h2>
          <p className={styles.subtitle}>
            Aducem în Moldova produsele originale direct de la distribuitori autorizați.
          </p>
        </AnimateIn>

        {/* Marquee strip */}
        <div className={styles.marqueeWrap}>
          <div className={styles.fade} aria-hidden="true" />
          <div className={styles.marquee}>
            {/* Duplicate for seamless loop */}
            {[...PARTNERS, ...PARTNERS].map((p, i) => (
              <div key={`${p.id}-${i}`} className={styles.logoCard}>
                <Image
                  src={p.src}
                  alt={p.name}
                  width={140}
                  height={70}
                  style={{ objectFit: "contain" }}
                  className={styles.logoImg}
                />
              </div>
            ))}
          </div>
          <div className={`${styles.fade} ${styles.fadeRight}`} aria-hidden="true" />
        </div>

        {/* Stats row */}
        <motion.div
          className={styles.stats}
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.div className={styles.stat} variants={staggerItem}>
            <span className={styles.statNum}><CountUp end={50} suffix="+" /></span>
            <span className={styles.statLabel}>Branduri importate</span>
          </motion.div>
          <div className={styles.statDivider} />
          <motion.div className={styles.stat} variants={staggerItem}>
            <span className={styles.statNum}><CountUp end={12} /></span>
            <span className={styles.statLabel}>Țări de origine</span>
          </motion.div>
          <div className={styles.statDivider} />
          <motion.div className={styles.stat} variants={staggerItem}>
            <span className={styles.statNum}><CountUp end={500} suffix="+" /></span>
            <span className={styles.statLabel}>Produse disponibile</span>
          </motion.div>
          <div className={styles.statDivider} />
          <motion.div className={styles.stat} variants={staggerItem}>
            <span className={styles.statNum}><CountUp end={3} suffix="+" /></span>
            <span className={styles.statLabel}>Ani pe piață</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
