"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import styles from "./ProductsSection.module.css";

const TABS = ["Top Vânzări", "Noutăți", "Exclusive"] as const;
type Tab = (typeof TABS)[number];

const ALL_PRODUCTS: Record<Tab, { id: number; img: string; name: string; price: string }[]> = {
  "Top Vânzări": [
    { id: 1,  img: "/img/p1.jpg",  name: "KitKat Original",     price: "29 MDL" },
    { id: 2,  img: "/img/p2.jpg",  name: "Snickers XL",         price: "35 MDL" },
    { id: 3,  img: "/img/p3.jpg",  name: "Kinder Bueno",        price: "42 MDL" },
    { id: 4,  img: "/img/p4.jpg",  name: "Haribo Gold",         price: "38 MDL" },
    { id: 5,  img: "/img/p5.jpg",  name: "Oreo Classic",        price: "25 MDL" },
    { id: 6,  img: "/img/p6.jpg",  name: "Pringles Original",   price: "55 MDL" },
  ],
  "Noutăți": [
    { id: 7,  img: "/img/p7.jpg",  name: "Coca-Cola Zero",      price: "22 MDL" },
    { id: 8,  img: "/img/p8.jpg",  name: "Fanta Mango",         price: "22 MDL" },
    { id: 9,  img: "/img/p9.jpg",  name: "Monster Energy",      price: "65 MDL" },
    { id: 10, img: "/img/p10.jpg", name: "Twix White",          price: "32 MDL" },
    { id: 11, img: "/img/p11.jpg", name: "M&M Peanut",         price: "45 MDL" },
    { id: 12, img: "/img/p12.jpg", name: "Ferrero Rocher",      price: "89 MDL" },
  ],
  "Exclusive": [
    { id: 5,  img: "/img/p5.jpg",  name: "Oreo Golden",         price: "48 MDL" },
    { id: 6,  img: "/img/p6.jpg",  name: "Pringles BBQ",        price: "60 MDL" },
    { id: 11, img: "/img/p11.jpg", name: "M&M Crispy",         price: "50 MDL" },
    { id: 12, img: "/img/p12.jpg", name: "Ferrero Collection",  price: "120 MDL" },
    { id: 1,  img: "/img/p1.jpg",  name: "KitKat Dark",         price: "35 MDL" },
    { id: 3,  img: "/img/p3.jpg",  name: "Kinder Surprise",     price: "39 MDL" },
  ],
};

const VISIBLE = 4;
const AUTO_INTERVAL = 3500;

export default function ProductsSection() {
  const [activeTab, setActiveTab] = useState<Tab>("Top Vânzări");
  const [index, setIndex] = useState(0);

  const products = ALL_PRODUCTS[activeTab];
  const maxIndex = products.length - VISIBLE;

  const next = useCallback(() => {
    setIndex((i) => (i >= maxIndex ? 0 : i + 1));
  }, [maxIndex]);

  const prev = () => {
    setIndex((i) => (i <= 0 ? maxIndex : i - 1));
  };

  useEffect(() => {
    setIndex(0);
  }, [activeTab]);

  useEffect(() => {
    const timer = setInterval(next, AUTO_INTERVAL);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <section className={styles.section} id="produse">
      {/* Wave top */}
      <div className={styles.wave} aria-hidden="true">
        <svg viewBox="0 0 1440 90" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0,0 C360,90 1080,90 1440,0 L1440,90 L0,90 Z"
            fill="#01934A"
          />
        </svg>
      </div>

      <div className={styles.inner}>
        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map((tab) => (
            <button
              key={tab}
              className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ""}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Carousel */}
        <div className={styles.carouselWrap}>
          <button className={styles.arrow} onClick={prev} aria-label="Înapoi">
            <BsChevronLeft size={22} />
          </button>

          <div className={styles.track}>
            {products.slice(index, index + VISIBLE).map((p) => (
              <div key={`${p.id}-${index}`} className={styles.card}>
                <div className={styles.cardImg}>
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="220px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.cardBody}>
                  <span className={styles.cardName}>{p.name}</span>
                  <span className={styles.cardPrice}>{p.price}</span>
                </div>
                <button className={styles.cardBtn}>Adaugă în coș</button>
              </div>
            ))}
          </div>

          <button className={styles.arrow} onClick={next} aria-label="Înainte">
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
    </section>
  );
}
