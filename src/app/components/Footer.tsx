"use client";
import Image from "next/image";
import { motion } from "framer-motion";
import { staggerContainer, staggerItem } from "./AnimateIn";
import { BsInstagram, BsFacebook, BsTiktok, BsEnvelope, BsTelephone, BsGeoAlt } from "react-icons/bs";
import { useTranslations } from "../context/LanguageContext";
import styles from "./Footer.module.css";

export default function Footer() {
  const t = useTranslations();
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
            src="/img/logo alb.png"
            alt="Challenge Store"
            width={130}
            height={44}
            style={{ objectFit: "contain" }}
            className={styles.logo}
          />
          <p className={styles.brandDesc}>{t.footer.brandDesc}</p>
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
          <h4 className={styles.colTitle}>{t.footer.colProducts}</h4>
          <ul className={styles.colLinks}>
            <li><a href="#produse">{t.footer.linkTopSales}</a></li>
            <li><a href="#produse">{t.footer.linkNews}</a></li>
            <li><a href="#produse">{t.footer.linkExclusive}</a></li>
            <li><a href="#produse">{t.footer.linkAmerican}</a></li>
            <li><a href="#produse">{t.footer.linkJapanese}</a></li>
            <li><a href="#produse">{t.footer.linkEuropean}</a></li>
          </ul>
        </motion.div>

        {/* Company column */}
        <motion.div className={styles.col} variants={staggerItem}>
          <h4 className={styles.colTitle}>{t.footer.colCompany}</h4>
          <ul className={styles.colLinks}>
            <li><a href="#despre">{t.footer.linkAbout}</a></li>
            <li><a href="#recenzii">{t.footer.linkReviews}</a></li>
            <li><a href="#">{t.footer.linkPartners}</a></li>
            <li><a href="/politica-de-confidentialitate">{t.footer.linkPrivacy}</a></li>
            <li><a href="/termeni-si-conditii">{t.footer.linkTerms}</a></li>
            <li><a href="/termeni-si-conditii#retur">{t.footer.linkReturn}</a></li>
          </ul>
        </motion.div>

        {/* Contact column */}
        <motion.div className={styles.col} variants={staggerItem}>
          <h4 className={styles.colTitle}>{t.footer.colContact}</h4>
          <ul className={styles.contactList}>
            <li>
              <BsGeoAlt size={15} className={styles.contactIcon} />
              <span>{t.footer.address}</span>
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
            <span>{t.footer.deliveryBadge}</span>
          </div>
        </motion.div>

      </motion.div>

      {/* Bottom bar */}
      <div className={styles.bottom}>
        <span>© {new Date().getFullYear()} Challenge Store. {t.footer.copyright}</span>
        <span className={styles.madeWith}>{t.footer.madeWith}</span>
      </div>
    </footer>
  );
}
