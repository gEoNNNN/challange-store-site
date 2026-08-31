"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useCart } from "../context/CartContext";
import { useTranslations } from "../context/LanguageContext";
import { Product } from "../produse/productsData";
import styles from "./ProductsSection.module.css";

const TABS = ["Top Vânzări", "Noutăți", "Exclusive"] as const;
type Tab = (typeof TABS)[number];

const EMPTY_PRODUCTS: Record<Tab, Product[]> = {
  "Top Vânzări": [],
  "Noutăți": [],
  "Exclusive": [],
};

const VISIBLE = 5;
const AUTO_INTERVAL = 3500;

export default function ProductsSection() {
  const t = useTranslations();
  const { addToCart } = useCart();
  const [activeTab, setActiveTab] = useState<Tab>("Top Vânzări");
  const [productsByTab, setProductsByTab] = useState<Record<Tab, Product[]>>(EMPTY_PRODUCTS);
  const [index, setIndex] = useState(0);

  const TAB_LABELS: Record<Tab, string> = {
    "Top Vânzări": t.productsSection.tabTopSales,
    "Noutăți":    t.productsSection.tabNews,
    "Exclusive":  t.productsSection.tabExclusive,
  };

  const products = productsByTab[activeTab];
  const maxIndex = Math.max(products.length - VISIBLE, 0);

  const next = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = () => {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  };

  useEffect(() => {
    const controller = new AbortController();
    const requests = [
      "/api/products?limit=16&sort=featured",
      "/api/products?limit=16&offset=16&sort=featured",
      "/api/products?limit=16&sort=price-desc",
    ].map((url) => fetch(url, { signal: controller.signal }).then((response) => {
      if (!response.ok) throw new Error("Produsele nu au putut fi încărcate");
      return response.json() as Promise<{ items: Product[] }>;
    }));

    Promise.all(requests)
      .then(([top, news, exclusive]) => setProductsByTab({
        "Top Vânzări": top.items,
        "Noutăți": news.items.length > 0 ? news.items : top.items,
        "Exclusive": exclusive.items,
      }))
      .catch((error) => {
        if (!(error instanceof Error && error.name === "AbortError")) setProductsByTab(EMPTY_PRODUCTS);
      });

    return () => controller.abort();
  }, []);

  useEffect(() => {
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <motion.section
      className={styles.section}
      id="produse"
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.05 }}
      transition={{ duration: 0.5 }}
    >
      {/* Green background with wavy top edge (transparent above) */}
      <div className={styles.greenBg} aria-hidden="true" />
      <div className={styles.wave} aria-hidden="true">
        <svg viewBox="0 0 1440 100" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M0,30 C360,100 1080,100 1440,30 L1440,100 L0,100 Z" fill="#01934A" />
        </svg>
      </div>

      {/* Decorative mascot left */}
      <div className={styles.mascotWrap} aria-hidden="true">
        <Image
          src="/img/m1.png.png"
          alt=""
          width={320}
          height={480}
          className={styles.mascot}
          priority={false}
        />
      </div>

      {/* Decorative mascot right */}
      <div className={styles.mascotWrapRight} aria-hidden="true">
        <Image
          src="/img/m2.png"
          alt=""
          width={320}
          height={480}
          className={styles.mascot}
          priority={false}
        />
      </div>

      <div className={styles.inner}>
        {/* Tabs */}
        <motion.div
          className={styles.tabsWrap}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <span className={styles.sectionLabel}>{t.productsSection.label}</span>
          <h2 className={styles.sectionTitle}>{t.productsSection.title} <span className={styles.sectionAccent}>{t.productsSection.titleAccent}</span></h2>
          <div className={styles.tabs}>
            {TABS.map((tab) => (
              <button
                key={tab}
                className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
                onClick={() => {
                  setActiveTab(tab);
                  setIndex(0);
                }}
              >
                <span className={styles.tabName}>{TAB_LABELS[tab]}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Carousel */}
        <div className={styles.carouselWrap}>
          <button className={styles.arrow} onClick={prev} aria-label={t.productsSection.prevAriaLabel}>
            <BsChevronLeft size={22} />
          </button>

          <div className={styles.track}>
            {products.slice(index, index + VISIBLE).map((p) => (
              <div key={`${p.uid ?? p.id}-${index}`} className={styles.card}>
                <Link href={`/produse/${p.uid ?? p.id}`} className={styles.cardLink}>
                  <div className={styles.cardImg}>
                    <Image
                      src={p.img}
                      alt={p.name}
                      fill
                      sizes="220px"
                      style={{ objectFit: "contain", padding: "14px" }}
                    />
                  </div>
                  <div className={styles.cardBody}>
                    <span className={styles.cardName}>{p.name}</span>
                    <span className={styles.cardPrice}>{p.price} MDL</span>
                  </div>
                </Link>
                <button className={styles.cardBtn} onClick={() => addToCart(p)}>{t.productsSection.addToCart}</button>
              </div>
            ))}
          </div>

          <button className={styles.arrow} onClick={next} aria-label={t.productsSection.nextAriaLabel}>
            <BsChevronRight size={22} />
          </button>
        </div>

        {/* Dots */}
        <div className={styles.dots}>
          {Array.from({ length: maxIndex + 1 }).map((_, i) => (
            <button
              key={i}
              className={`${styles.dot} ${index === i ? styles.dotActive : ""}`}
              onClick={() => setIndex(i)}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </motion.section>
  );
}
