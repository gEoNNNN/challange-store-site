"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { BsChevronLeft, BsChevronRight } from "react-icons/bs";
import { useTranslations } from "../context/LanguageContext";
import styles from "./ProductsSection.module.css";

const TABS = ["Top Vânzări", "Noutăți", "Exclusive"] as const;
type Tab = (typeof TABS)[number];
type TabIndex = 0 | 1 | 2;

const ALL_PRODUCTS: Record<Tab, { id: number; img: string; name: string; price: string }[]> = {
  "Top Vânzări": [
    { id: 9,  img: "https://del.barbarich.be/DbImage/BigImage/99ecd62e-bf0f-4d27-926d-6de153806124",                          name: "Mega Gummies Milkshake 120g",        price: "120 MDL" },
    { id: 21, img: "https://sweetandglory.com/images/product/xl/ICEB002.jpg?t=1761123898",                                    name: "Ice Breakers Sours 42g",             price: "75 MDL"  },
    { id: 22, img: "https://americanfoodmart.co.uk/wp-content/uploads/2022/03/AFM00491.jpg",                                  name: "Ice Breakers Sours Berry 42g",       price: "75 MDL"  },
    { id: 10, img: "https://sweetandglory.com/images/product/xl/HARI012.jpg?t=1761124474",                                   name: "Haribo Smurfs Sour 113g",           price: "90 MDL"  },
    { id: 27, img: "https://sweetandglory.com/images/product/xl/TOPP016.jpg?t=1761123917",                                   name: "Bazooka Throwback Mini 42g",        price: "45 MDL"  },
    { id: 23, img: "https://sweetandglory.com/images/product/xl/CHEW008L.jpg?t=1761124591",                                  name: "Chewits Cola Stick 30g",            price: "35 MDL"  },
    { id: 17, img: "https://api.hancocks.co.uk/media/catalog/product/3/1/316094_a.png",                                      name: "Chewits Cherry Stick 30g",          price: "25 MDL"  },
    { id: 11, img: "https://api.hancocks.co.uk/media/catalog/product/3/1/318623_1.jpg",                                      name: "Más+ Messi Limón Lime 500ml",       price: "40 MDL"  },
    { id: 4,  img: "https://sweetandglory.com/images/product/xl/BYUM013.jpg?t=1761124002",                                   name: "Bubble Yum Cotton Candy 79g",       price: "73 MDL"  },
    { id: 20, img: "https://sweetandglory.com/images/product/xl/CHEW010L.jpg?t=1761124549",                                  name: "Chewits Fruit Salad Stick 30g",     price: "25 MDL"  },
    { id: 8,  img: "https://avatars.mds.yandex.net/get-mpic/15434382/2a0000019817bba486c7c442dd2a67524a77/optimize",         name: "Bebeto Cherry 50p 70g",             price: "25 MDL"  },
    { id: 1,  img: "https://sweetandglory.com/images/product/xl/JOLL091.jpg?t=1761123886",                                   name: "Jolly Rancher Gummies Sours 109g",  price: "80 MDL"  },
  ],
  "Noutăți": [
    { id: 12, img: "https://joessweetiebarn.co.uk/cdn/shop/files/Screenshot2025-09-06at14.22.32.png?v=1757164965&width=1800", name: "Mega Gummies Hotdog 120g",          price: "120 MDL" },
    { id: 13, img: "https://ameelcandyworld.be/product/image/large/54774_1.jpg",                                              name: "Mega Gummies Pizza 120g",           price: "120 MDL" },
    { id: 14, img: "https://www.sweetsandcandy.co.uk/media/amasty/webp/catalog/product/cache/cf8544c830259d2d4e126894de8f4ae9/w/a/warheads-blue-raspberry-cubes-99g-american-sweets_jpg.webp", name: "Warheads Blue Raspberry 85g", price: "90 MDL" },
    { id: 16, img: "https://americansweets.co.uk/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/s/o/sour-patch-tropical-theatre-box-3.5oz.png", name: "Sour Patch Kids Tropical 99g", price: "90 MDL" },
    { id: 15, img: "https://i5.walmartimages.com/asr/a3efe2f2-abec-4a6f-92d1-06b877641ceb.c2a318af37a775a1243dec326b73c5bc.jpeg?odnHeight=2000&odnWidth=2000&odnBg=FFFFFF", name: "Warheads Sour Jelly Beans 113g", price: "90 MDL" },
    { id: 19, img: "https://jdmdistributors.co.uk/cdn/shop/products/HotTamalesCinnamon_1800x1800.png?v=1754471905",          name: "Hot Tamales Cinnamon 120g",         price: "80 MDL"  },
    { id: 34, img: "https://candycave.ie/cdn/shop/files/sour-patch-watermelon-king-size-canada-96g-453926_26ab23a5-9b78-4102-856c-e133ff752ee7.jpg?v=1770399714&width=1946", name: "Sour Patch Watermelon 96g", price: "75 MDL" },
    { id: 18, img: "https://sweetseeker.com.au/cdn/shop/files/berry-copa-crush-1.webp?v=1759223940&width=990",               name: "Más+ Messi Berry Copa 500ml",       price: "75 MDL"  },
    { id: 32, img: "https://www.sodapopbros.com/cdn/shop/products/big-league-chew-blue-raspberry-bubble-gum-575949.jpg?v=1694528283", name: "Big League Chew Blue Raspberry 60g", price: "70 MDL" },
    { id: 33, img: "https://americanfizz.co.uk/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/b/i/big-league-cotton-candy.png", name: "Big League Chew Cotton Candy 60g", price: "70 MDL" },
    { id: 25, img: "https://sweetandglory.com/images/product/m/BYUM002.jpg?t=1761124002",                                    name: "Bubble Yum Cotton Candy 39g",       price: "42 MDL"  },
    { id: 24, img: "https://sweetandglory.com/images/product/xl/NEWB020L.jpg?t=1761124329",                                  name: "Toxic Waste Goop Gum 44g",          price: "50 MDL"  },
  ],
  "Exclusive": [
    { id: 9,  img: "https://del.barbarich.be/DbImage/BigImage/99ecd62e-bf0f-4d27-926d-6de153806124",                          name: "Mega Gummies Milkshake 120g",        price: "120 MDL" },
    { id: 13, img: "https://ameelcandyworld.be/product/image/large/54774_1.jpg",                                              name: "Mega Gummies Pizza 120g",           price: "120 MDL" },
    { id: 14, img: "https://www.sweetsandcandy.co.uk/media/amasty/webp/catalog/product/cache/cf8544c830259d2d4e126894de8f4ae9/w/a/warheads-blue-raspberry-cubes-99g-american-sweets_jpg.webp", name: "Warheads Blue Raspberry 85g", price: "90 MDL" },
    { id: 10, img: "https://sweetandglory.com/images/product/xl/HARI012.jpg?t=1761124474",                                   name: "Haribo Smurfs Sour 113g",           price: "90 MDL"  },
    { id: 16, img: "https://americansweets.co.uk/media/catalog/product/cache/74c1057f7991b4edb2bc7bdaa94de933/s/o/sour-patch-tropical-theatre-box-3.5oz.png", name: "Sour Patch Kids Tropical 99g", price: "90 MDL" },
    { id: 1,  img: "https://sweetandglory.com/images/product/xl/JOLL091.jpg?t=1761123886",                                   name: "Jolly Rancher Gummies Sours 109g",  price: "80 MDL"  },
    { id: 19, img: "https://jdmdistributors.co.uk/cdn/shop/products/HotTamalesCinnamon_1800x1800.png?v=1754471905",          name: "Hot Tamales Cinnamon 120g",         price: "80 MDL"  },
    { id: 18, img: "https://sweetseeker.com.au/cdn/shop/files/berry-copa-crush-1.webp?v=1759223940&width=990",               name: "Más+ Messi Berry Copa 500ml",       price: "75 MDL"  },
    { id: 21, img: "https://sweetandglory.com/images/product/xl/ICEB002.jpg?t=1761123898",                                   name: "Ice Breakers Sours 42g",            price: "75 MDL"  },
    { id: 34, img: "https://candycave.ie/cdn/shop/files/sour-patch-watermelon-king-size-canada-96g-453926_26ab23a5-9b78-4102-856c-e133ff752ee7.jpg?v=1770399714&width=1946", name: "Sour Patch Watermelon 96g", price: "75 MDL" },
    { id: 32, img: "https://www.sodapopbros.com/cdn/shop/products/big-league-chew-blue-raspberry-bubble-gum-575949.jpg?v=1694528283", name: "Big League Chew Blue Raspberry 60g", price: "70 MDL" },
    { id: 28, img: "https://sweetandglory.com/images/product/xl/EFB032L.jpg?t=1761124104",                                   name: "Hershey's Cookies 'n' Creme 40g",   price: "50 MDL"  },
  ],
};

const VISIBLE = 5;
const AUTO_INTERVAL = 3500;

export default function ProductsSection() {
  const t = useTranslations();
  const [activeTab, setActiveTab] = useState<Tab>("Top Vânzări");
  const [index, setIndex] = useState(0);

  const TAB_LABELS: Record<Tab, string> = {
    "Top Vânzări": t.productsSection.tabTopSales,
    "Noutăți":    t.productsSection.tabNews,
    "Exclusive":  t.productsSection.tabExclusive,
  };

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
                onClick={() => setActiveTab(tab)}
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
                <button className={styles.cardBtn}>{t.productsSection.addToCart}</button>
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
