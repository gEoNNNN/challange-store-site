"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  BsArrowLeft, BsCart3, BsStarFill, BsStar, BsHeart, BsHeartFill,
  BsGeoAlt, BsTag, BsBoxSeam, BsListCheck, BsGraphUp,
} from "react-icons/bs";
import { useCart } from "../../context/CartContext";
import { useFavorites } from "../../context/FavoritesContext";
import { PRODUCTS, Product } from "../productsData";
import styles from "./page.module.css";

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s}>
          {rating >= s
            ? <BsStarFill size={14} color="#FFB800" />
            : <BsStar size={14} color="#D1D5DB" />}
        </span>
      ))}
    </span>
  );
}

export default function ProductDetailPage() {
  const params = useParams();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const productIdentifier = String(params.id);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/products?uid=${encodeURIComponent(productIdentifier)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Produsul nu a putut fi încărcat");
        return response.json();
      })
      .then(async (data: { item: Product | null }) => {
        const fallback = PRODUCTS.find((item) => String(item.id) === productIdentifier) ?? null;
        const loadedProduct = data.item ?? fallback;
        setProduct(loadedProduct);
        if (!loadedProduct) return;

        const query = new URLSearchParams({ limit: "5" });
        if (loadedProduct.brand) query.append("brand", loadedProduct.brand);
        const response = await fetch(`/api/products?${query}`, { signal: controller.signal });
        if (!response.ok) return;
        const relatedData = await response.json() as { items: Product[] };
        setRelated(relatedData.items.filter((item) => item.uid !== loadedProduct.uid).slice(0, 4));
      })
      .catch((error) => {
        if (error instanceof Error && error.name === "AbortError") return;
        setProduct(PRODUCTS.find((item) => String(item.id) === productIdentifier) ?? null);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [productIdentifier]);

  if (loading) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundInner}>
          <p>Se încarcă produsul…</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className={styles.notFound}>
        <div className={styles.notFoundInner}>
          <span className={styles.notFoundIcon}>🔍</span>
          <h2>Produs negăsit</h2>
          <p>Produsul cu ID-ul #{params.id} nu există în catalog.</p>
          <Link href="/produse" className={styles.backLink}>
            <BsArrowLeft size={16} /> Înapoi la produse
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < qty; i++) addToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const fav = isFavorite(product.id);
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;

  return (
    <div className={styles.page}>

      {/* ── Top bar ── */}
      <div className={styles.topBar}>
        <div className={styles.topBarInner}>
          <Link href="/" className={styles.crumb}>Acasă</Link>
          <span className={styles.crumbSep}>/</span>
          <Link href="/produse" className={styles.crumb}>Produse</Link>
          <span className={styles.crumbSep}>/</span>
          <span className={styles.crumbActive}>{product.name}</span>
        </div>
      </div>

      {/* ── Product hero ── */}
      <div className={styles.hero}>
        <div className={styles.heroInner}>

          {/* Image column */}
          <motion.div
            className={styles.imageCol}
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.imageFrame}>
              {discount && <span className={styles.discountBadge}>-{discount}%</span>}
              {product.isNew && <span className={styles.newBadge}>NOU</span>}
              <Image
                src={product.img}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
                priority
              />
            </div>
          </motion.div>

          {/* Details column */}
          <motion.div
            className={styles.detailsCol}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.badgeRow}>
              <span className={styles.categoryBadge}>{product.category}</span>
              <span className={styles.countryBadge}>
                <BsGeoAlt size={11} /> {product.country}
              </span>
            </div>

            <h1 className={styles.productName}>{product.name}</h1>

            <div className={styles.brandRow}>
              <BsTag size={13} className={styles.brandIcon} />
              <span className={styles.brandLabel}>Brand:</span>
              <span className={styles.brandValue}>{product.brand}</span>
            </div>

            <div className={styles.ratingRow}>
              <StarRating rating={Math.round(product.rating)} />
              <span className={styles.ratingNum}>{product.rating}</span>
              <span className={styles.reviewCount}>({product.reviews} recenzii)</span>
            </div>

            <div className={styles.priceBlock}>
              <span className={styles.price}>{product.price} MDL</span>
              {product.originalPrice && (
                <span className={styles.oldPrice}>{product.originalPrice} MDL</span>
              )}
            </div>

            <div className={styles.qtyRow}>
              <button className={styles.qtyBtn} onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span className={styles.qtyVal}>{qty}</span>
              <button className={styles.qtyBtn} onClick={() => setQty((q) => q + 1)}>+</button>
            </div>

            <div className={styles.actions}>
              <button
                className={`${styles.addBtn} ${added ? styles.addBtnAdded : ""}`}
                onClick={handleAddToCart}
              >
                <BsCart3 size={18} />
                {added ? "Adăugat în coș ✓" : "Adaugă în coș"}
              </button>
              <button
                className={`${styles.favBtn} ${fav ? styles.favBtnActive : ""}`}
                onClick={() => toggleFavorite(product.id)}
                aria-label="Favorite"
              >
                {fav ? <BsHeartFill size={18} /> : <BsHeart size={18} />}
              </button>
            </div>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <BsBoxSeam size={16} className={styles.metaIcon} />
                <div>
                  <span className={styles.metaLabel}>Disponibilitate</span>
                  <span className={styles.metaValue} style={{ color: "#01934A" }}>În stoc</span>
                </div>
              </div>
              <div className={styles.metaItem}>
                <BsGeoAlt size={16} className={styles.metaIcon} />
                <div>
                  <span className={styles.metaLabel}>Origine</span>
                  <span className={styles.metaValue}>{product.country}</span>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Full description ── */}
      {product.fullDescription && (
        <div className={styles.descSection}>
          <div className={styles.descInner}>
            <motion.h2
              className={styles.descTitle}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              Descriere detaliată
            </motion.h2>
            <div className={styles.descGrid}>
              {product.fullDescription.split('\n\n').map((para, i) => {
                // Detect if it's ingredients section
                if (para.toLowerCase().startsWith('ingrediente:')) {
                  return (
                    <motion.div
                      key={i}
                      className={styles.descCard}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      <div className={styles.descCardHeader}>
                        <BsListCheck size={20} className={styles.descIcon} />
                        <h3 className={styles.descCardTitle}>Ingrediente</h3>
                      </div>
                      <p className={styles.descCardText}>{para.replace(/^ingrediente:\s*/i, '')}</p>
                    </motion.div>
                  );
                }
                // Detect if it's nutritional values
                if (para.toLowerCase().includes('valori nutriționale') || para.toLowerCase().includes('valori nutritionale')) {
                  return (
                    <motion.div
                      key={i}
                      className={styles.descCard}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: i * 0.08 }}
                    >
                      <div className={styles.descCardHeader}>
                        <BsGraphUp size={20} className={styles.descIcon} />
                        <h3 className={styles.descCardTitle}>Valori nutriționale</h3>
                      </div>
                      <p className={styles.descCardText}>{para.replace(/^valori nutri[tț]ionale[^:]*:\s*/i, '')}</p>
                    </motion.div>
                  );
                }
                // Regular paragraph
                return (
                  <motion.div
                    key={i}
                    className={styles.descCard}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.08 }}
                  >
                    <p className={styles.descCardText}>{para}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Related products ── */}
      {related.length > 0 && (
        <div className={styles.related}>
          <div className={styles.relatedInner}>
            <h2 className={styles.relatedTitle}>Produse similare</h2>
            <div className={styles.relatedGrid}>
              {related.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.07 }}
                >
                  <Link href={`/produse/${p.uid ?? p.id}`} className={styles.relatedCard}>
                    <div className={styles.relatedImg}>
                      <Image
                        src={p.img}
                        alt={p.name}
                        fill
                        sizes="200px"
                        style={{ objectFit: "cover" }}
                      />
                    </div>
                    <div className={styles.relatedInfo}>
                      <span className={styles.relatedBrand}>{p.brand}</span>
                      <span className={styles.relatedName}>{p.name}</span>
                      <strong className={styles.relatedPrice}>{p.price} MDL</strong>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
