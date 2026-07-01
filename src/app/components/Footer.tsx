"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "./AnimateIn";
import { BsInstagram, BsFacebook, BsTiktok, BsEnvelope, BsTelephone, BsGeoAlt } from "react-icons/bs";
import styles from "./Footer.module.css";

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <motion.div
        className={styles.inner}
        variants={staggerContainer}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.1 }}
      >

        {/* Brand column */}
        <motion.div className={styles.brand} variants={staggerItem}>
          <Image
            src="/img/logo.jpg"
            alt="Challenge Store"
            width={130}
            height={44}
            style={{ objectFit: "contain" }}
            className={styles.logo}
          />
          <p className={styles.brandDesc}>
            Aducem în Moldova cele mai îndrăgite dulciuri și băuturi
            internaționale — direct de la distribuitori autorizați.
          </p>
          <div className={styles.socials}>
            <a href="#" aria-label="Instagram" className={styles.socialLink}>
              <BsInstagram size={18} />
            </a>
            <a href="#" aria-label="Facebook" className={styles.socialLink}>
              <BsFacebook size={18} />
            </a>
            <a href="#" aria-label="TikTok" className={styles.socialLink}>
              <BsTiktok size={18} />
            </a>
          </div>
        </motion.div>

        {/* Links column */}
        <motion.div className={styles.col} variants={staggerItem}>
          <h4 className={styles.colTitle}>Produse</h4>
          <ul className={styles.colLinks}>
            <li><a href="#produse">Top Vânzări</a></li>
            <li><a href="#produse">Noutăți</a></li>
            <li><a href="#produse">Exclusive</a></li>
            <li><a href="#produse">Produse Americane</a></li>
            <li><a href="#produse">Produse Japoneze</a></li>
            <li><a href="#produse">Gusturi Europene</a></li>
          </ul>
        </motion.div>

        {/* Company column */}
        <motion.div className={styles.col} variants={staggerItem}>
          <h4 className={styles.colTitle}>Companie</h4>
          <ul className={styles.colLinks}>
            <li><a href="#despre">Despre noi</a></li>
            <li><a href="#recenzii">Recenzii</a></li>
            <li><a href="#">Parteneri</a></li>
            <li><a href="#">Politica de confidențialitate</a></li>
            <li><a href="#">Termeni și condiții</a></li>
            <li><a href="#">Retur & Garanție</a></li>
          </ul>
        </motion.div>

        {/* Contact column */}
        <motion.div className={styles.col} variants={staggerItem}>
          <h4 className={styles.colTitle}>Contact</h4>
          <ul className={styles.contactList}>
            <li>
              <BsGeoAlt size={15} className={styles.contactIcon} />
              <span>Chișinău, Republica Moldova</span>
            </li>
            <li>
              <BsTelephone size={15} className={styles.contactIcon} />
              <a href="tel:+37360000000">+373 60 000 000</a>
            </li>
            <li>
              <BsEnvelope size={15} className={styles.contactIcon} />
              <a href="mailto:contact@challengestore.md">contact@challengestore.md</a>
            </li>
          </ul>

          <div className={styles.badge}>
            <span>🚚</span>
            <span>Livrare rapidă în toată Moldova</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Challenge Store. Toate drepturile rezervate.</span>
        <span className={styles.madeWith}>Făcut cu ❤️ în Moldova</span>
      </div>
    </footer>
  );
}
