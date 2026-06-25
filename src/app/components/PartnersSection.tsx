import Image from "next/image";
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
      {/* Wave from green to white */}
      <div className={styles.wave} aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,90 C360,0 1080,0 1440,90 L1440,0 L0,0 Z"
            fill="#006e37"
          />
        </svg>
      </div>

      <div className={styles.inner}>
        {/* Heading */}
        <div className={styles.heading}>
          <span className={styles.label}>Colaborăm cu cele mai mari branduri</span>
          <h2 className={styles.title}>Branduri <span className={styles.accent}>Partenere</span></h2>
          <p className={styles.subtitle}>
            Aducem în Moldova produsele originale direct de la distribuitori autorizați.
          </p>
        </div>

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
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNum}>50+</span>
            <span className={styles.statLabel}>Branduri importate</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>12</span>
            <span className={styles.statLabel}>Țări de origine</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>500+</span>
            <span className={styles.statLabel}>Produse disponibile</span>
          </div>
          <div className={styles.statDivider} />
          <div className={styles.stat}>
            <span className={styles.statNum}>3+</span>
            <span className={styles.statLabel}>Ani pe piață</span>
          </div>
        </div>
      </div>
    </section>
  );
}
