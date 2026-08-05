"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsSearch, BsHeart, BsHeartFill, BsStarFill, BsStar,
  BsChevronDown, BsChevronUp, BsX, BsCart3, BsGrid3X3Gap,
  BsListUl, BsSliders, BsFunnel, BsCheckCircleFill,
} from "react-icons/bs";
import { useCart } from "../context/CartContext";
import { useFavorites } from "../context/FavoritesContext";
import { CATEGORIES, BRANDS, COUNTRIES, ATTRIBUTES, Product } from "./productsData";
import { useTranslations } from "../context/LanguageContext";
import styles from "./page.module.css";

const SORT_VALUES = ["featured", "price-asc", "price-desc", "rating", "new"] as const;

const PRICE_MAX = 200;

function StarRating({ rating }: { rating: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={rating >= s ? styles.starFilled : styles.starEmpty}>
          {rating >= s ? <BsStarFill size={11} /> : <BsStar size={11} />}
        </span>
      ))}
    </span>
  );
}

function FilterSection({
  title, children, id, collapsed, toggle,
}: {
  title: string; children: React.ReactNode; id: string;
  collapsed: boolean; toggle: (id: string) => void;
}) {
  return (
    <div className={styles.filterSection}>
      <button className={styles.filterHeader} onClick={() => toggle(id)}>
        <span>{title}</span>
        {collapsed ? <BsChevronDown size={14} /> : <BsChevronUp size={14} />}
      </button>
      {!collapsed && <div className={styles.filterBody}>{children}</div>}
    </div>
  );
}

export default function ProduseePage() {
  const t = useTranslations();
  const { addToCart } = useCart();
  const { toggleFavorite, isFavorite } = useFavorites();

  const SORT_OPTIONS = [
    { value: "featured",   label: t.productsPage.sortFeatured },
    { value: "price-asc",  label: t.productsPage.sortPriceAsc },
    { value: "price-desc", label: t.productsPage.sortPriceDesc },
    { value: "rating",     label: t.productsPage.sortRating },
    { value: "new",        label: t.productsPage.sortNew },
  ];

  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("featured");
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid");
  const [collapsed, setCollapsed]     = useState<string[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("Toate");

  const [selCategories, setSelCategories] = useState<string[]>([]);
  const [selBrands, setSelBrands]         = useState<string[]>([]);
  const [selCountries, setSelCountries]   = useState<string[]>([]);
  const [selAttributes, setSelAttributes] = useState<string[]>([]);
  const [priceRange, setPriceRange]       = useState<[number, number]>([0, PRICE_MAX]);
  const [displayCount, setDisplayCount]   = useState(12);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const [liveProducts, setLiveProducts] = useState<Product[] | null>(null);
  const [syncReady, setSyncReady] = useState(false);

  useEffect(() => {
    fetch("/api/products")
      .then((r) => r.json())
      .then((data: Product[]) => {
        setLiveProducts(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setLiveProducts([]);
      })
      .finally(() => setSyncReady(true));
  }, []);

  // Before the first fetch completes show nothing (avoids flash of 1400 fake products)
  // After fetch: use ONLY live data from SalesExpert
  const allProducts = syncReady ? (liveProducts ?? []) : [];

  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast = (name: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(name);
    toastTimer.current = setTimeout(() => setToast(null), 2500);
  };

  useEffect(() => () => { if (toastTimer.current) clearTimeout(toastTimer.current); }, []);

  const toggleCollapse = (id: string) =>
    setCollapsed((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  /* ── Active filter chips ── */
  const chips: { label: string; clear: () => void }[] = [
    ...selCategories.map((c) => ({ label: c, clear: () => setSelCategories((p) => p.filter((x) => x !== c)) })),
    ...selBrands.map((b)     => ({ label: b, clear: () => setSelBrands((p)     => p.filter((x) => x !== b)) })),
    ...selCountries.map((c)  => ({ label: c, clear: () => setSelCountries((p)  => p.filter((x) => x !== c)) })),
    ...selAttributes.map((a) => ({ label: a, clear: () => setSelAttributes((p) => p.filter((x) => x !== a)) })),
    ...(priceRange[0] > 0 || priceRange[1] < PRICE_MAX
      ? [{ label: `${priceRange[0]}–${priceRange[1]} MDL`, clear: () => setPriceRange([0, PRICE_MAX]) }]
      : []),
  ];

  const clearAll = () => {
    setSelCategories([]); setSelBrands([]); setSelCountries([]);
    setSelAttributes([]); setPriceRange([0, PRICE_MAX]);
    setActiveCategory("Toate"); setSearch(""); setDisplayCount(12);
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product);
    showToast(product.name);
  };

  /* ── Filtered & sorted products ── */
  const filtered = useMemo(() => {
    let list = allProducts.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeCategory !== "Toate" && p.category !== activeCategory) return false;
      if (selCategories.length && !selCategories.includes(p.category)) return false;
      if (selBrands.length    && !selBrands.includes(p.brand))         return false;
      if (selCountries.length && !selCountries.includes(p.country))    return false;
      if (selAttributes.length && !selAttributes.every((a) => p.attributes.includes(a))) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    });
    switch (sortBy) {
      case "price-asc":  list = [...list].sort((a, b) => a.price - b.price); break;
      case "price-desc": list = [...list].sort((a, b) => b.price - a.price); break;
      case "rating":     list = [...list].sort((a, b) => b.rating - a.rating); break;
      case "new":        list = [...list].filter((p) => p.isNew).concat(list.filter((p) => !p.isNew)); break;
    }
    return list;
  }, [allProducts, search, activeCategory, selCategories, selBrands, selCountries, selAttributes, priceRange, sortBy]);

  const displayed = filtered.slice(0, displayCount);
  const hasMore = displayCount < filtered.length;

  useEffect(() => {
    setDisplayCount(12);
  }, [search, activeCategory, selCategories, selBrands, selCountries, selAttributes, priceRange, sortBy]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setDisplayCount((prev) => prev + 12);
        }
      },
      { rootMargin: "200px" }
    );
    if (loadMoreRef.current) observer.observe(loadMoreRef.current);
    return () => observer.disconnect();
  }, [hasMore]);

  return (
    <div className={styles.page}>
      {/* ── Hero ── */}
      <div className={styles.heroBar}>
        <div className={styles.heroBarInner}>

          {/* Left column */}
          <div className={styles.heroLeft}>
            <motion.nav className={styles.breadcrumb} aria-label="Breadcrumb"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <Link href="/">{t.productsPage.breadcrumbHome}</Link>
              <span>/</span>
              <span>{t.productsPage.breadcrumbProducts}</span>
            </motion.nav>

            <motion.div className={styles.heroPillRow}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.06 }}>
              <span className={styles.heroPill}><BsCheckCircleFill size={11} /> 100% Original</span>
              <span className={styles.heroPill}>🌍 12 țări</span>
              <span className={styles.heroPill}>⭐ 4.9</span>
            </motion.div>

            <motion.h1 className={styles.pageTitle}
              initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}>
              {t.productsPage.pageTitle}
            </motion.h1>

            <motion.p className={styles.pageSubtitle}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.18 }}>
              {t.productsPage.pageSubtitle.replace("{count}", String(filtered.length))}
            </motion.p>

            <motion.div className={styles.heroSearchWrap}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.26 }}>
              <BsSearch className={styles.heroSearchIcon} size={17} />
              <input
                className={styles.heroSearchInput}
                placeholder={t.productsPage.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button className={styles.heroSearchClear} onClick={() => setSearch("")}>
                  <BsX size={18} />
                </button>
              )}
            </motion.div>
          </div>

          {/* Right column — bento photo grid */}
          <motion.div className={styles.heroBento}
            initial={{ opacity: 0, x: 36 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}>
            <div className={styles.heroBentoMain}>
              <Image src="/img/photo1.jpg" alt="Challenge Store" fill
                sizes="(max-width:900px) 100vw, 40vw" style={{ objectFit: "cover" }} priority />
              <div className={styles.heroBentoMainOverlay}>
                <span className={styles.heroBentoLabel}>Challenge Store</span>
                <span className={styles.heroBentoCity}>Chișinău, Moldova</span>
              </div>
            </div>
            <div className={styles.heroBentoSide}>
              <div className={styles.heroBentoSmall}>
                <Image src="/img/photo2.jpg" alt="Produse internaționale" fill
                  sizes="(max-width:900px) 50vw, 20vw" style={{ objectFit: "cover" }} />
                <span className={styles.heroBentoTag}>🚀 500+ produse</span>
              </div>
              <div className={styles.heroBentoSmall}>
                <Image src="/img/photo3.jpg" alt="Colecție" fill
                  sizes="(max-width:900px) 50vw, 20vw" style={{ objectFit: "cover" }} />
                <span className={styles.heroBentoTag}>🌍 12 țări</span>
              </div>
            </div>
          </motion.div>

        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className={styles.catBar}>
        <div className={styles.catBarInner}>
          {[{ key: "Toate", label: t.productsPage.categoryAll }, ...CATEGORIES.map((c) => ({ key: c, label: c }))].map(({ key, label }) => (
            <button
              key={key}
              className={`${styles.catTab} ${activeCategory === key ? styles.catTabActive : ""}`}
              onClick={() => setActiveCategory(key)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={`${styles.layout} ${!sidebarOpen ? styles.layoutNoSidebar : ""}`}>

        {/* SIDEBAR */}
        <aside className={`${styles.sidebar} ${!sidebarOpen ? styles.sidebarHidden : ""}`}>
          <div className={styles.sidebarHeader}>
            <BsSliders size={16} />
            <span>{t.productsPage.filtersSidebarTitle}</span>
            {chips.length > 0 && (
              <button className={styles.clearAll} onClick={clearAll}>{t.productsPage.clearAll}</button>
            )}
          </div>

          <FilterSection title={t.productsPage.filterCategory} id="cat" collapsed={collapsed.includes("cat")} toggle={toggleCollapse}>
            {CATEGORIES.map((c) => (
              <label key={c} className={styles.checkRow}>
                <input type="checkbox" checked={selCategories.includes(c)}
                  onChange={() => toggleArr(selCategories, c, setSelCategories)} />
                <span>{c}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title={t.productsPage.filterBrand} id="brand" collapsed={collapsed.includes("brand")} toggle={toggleCollapse}>
            {BRANDS.map((b) => (
              <label key={b} className={styles.checkRow}>
                <input type="checkbox" checked={selBrands.includes(b)}
                  onChange={() => toggleArr(selBrands, b, setSelBrands)} />
                <span>{b}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title={t.productsPage.filterPrice} id="price" collapsed={collapsed.includes("price")} toggle={toggleCollapse}>
            <div className={styles.priceDisplay}>
              <span>{priceRange[0]} MDL</span><span>—</span><span>{priceRange[1]} MDL</span>
            </div>
            <input type="range" min={0} max={PRICE_MAX} value={priceRange[0]}
              className={styles.rangeInput}
              onChange={(e) => { const v = +e.target.value; if (v <= priceRange[1]) setPriceRange([v, priceRange[1]]); }} />
            <input type="range" min={0} max={PRICE_MAX} value={priceRange[1]}
              className={styles.rangeInput}
              onChange={(e) => { const v = +e.target.value; if (v >= priceRange[0]) setPriceRange([priceRange[0], v]); }} />
          </FilterSection>

          <FilterSection title="Țara de origine" id="country" collapsed={collapsed.includes("country")} toggle={toggleCollapse}>
            {COUNTRIES.map((c) => (
              <label key={c} className={styles.checkRow}>
                <input type="checkbox" checked={selCountries.includes(c)}
                  onChange={() => toggleArr(selCountries, c, setSelCountries)} />
                <span>{c}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title={t.productsPage.filterAttributes} id="attr" collapsed={collapsed.includes("attr")} toggle={toggleCollapse}>
            {ATTRIBUTES.map((a) => (
              <label key={a} className={styles.checkRow}>
                <input type="checkbox" checked={selAttributes.includes(a)}
                  onChange={() => toggleArr(selAttributes, a, setSelAttributes)} />
                <span>{a}</span>
              </label>
            ))}
          </FilterSection>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <button
              className={`${styles.filterToggleBtn} ${sidebarOpen ? styles.filterToggleBtnActive : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <BsSliders size={15} />
              <span>{t.productsPage.filtersSidebarTitle}{chips.length > 0 ? ` (${chips.length})` : ""}</span>
            </button>
            <div className={styles.searchWrap}>
              <BsSearch className={styles.searchIcon} size={16} />
              <input
                className={styles.searchInput}
                placeholder={t.productsPage.searchPlaceholder}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className={styles.toolbarRight}>
              <span className={styles.countLabel}>{filtered.length} produse</span>
              <div className={styles.sortWrap}>
                <BsFunnel size={14} />
                <select className={styles.sortSelect} value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}>
                  {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className={styles.viewToggle}>
                <button className={`${styles.viewBtn} ${viewMode === "grid" ? styles.viewBtnActive : ""}`}
                  onClick={() => setViewMode("grid")} aria-label="Grid"><BsGrid3X3Gap size={17} /></button>
                <button className={`${styles.viewBtn} ${viewMode === "list" ? styles.viewBtnActive : ""}`}
                  onClick={() => setViewMode("list")} aria-label="List"><BsListUl size={17} /></button>
              </div>
            </div>
          </div>

          {/* Active chips */}
          {chips.length > 0 && (
            <div className={styles.chips}>
              {chips.map((chip, i) => (
                <button key={i} className={styles.chip} onClick={chip.clear}>
                  {chip.label} <BsX size={14} />
                </button>
              ))}
              <button className={styles.chipClear} onClick={clearAll}>{t.productsPage.clearAll}</button>
            </div>
          )}

          {/* Product grid/list */}
          {!syncReady ? (
            <div className={styles.empty}>
              <div className={styles.spinner} />
              <p style={{ marginTop: 16 }}>Se încarcă catalogul…</p>
            </div>
          ) : allProducts.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🔄</span>
              <p><strong>Catalogul este gol.</strong><br />Sincronizarea cu SalesExpert nu a reușit sau nu există produse în stoc.</p>
              <p style={{ fontSize: 13, opacity: 0.65, marginTop: 8 }}>Porniți SalesExpert și reporniți serverul pentru a sincroniza produsele.</p>
            </div>
          ) : displayed.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}><BsSearch size={40} /></span>
              <p>Nu am găsit produse pentru filtrele selectate.</p>
              <button className={styles.clearAll} onClick={clearAll}>{t.productsPage.clearAll}</button>
            </div>
          ) : (
            <>
              <div className={viewMode === "grid" ? styles.grid : styles.listView}>
                {displayed.map((p: Product, i: number) => (
                  <ProductCard key={p.id} index={i} product={p}
                    isFav={isFavorite(p.id)}
                    onFav={() => toggleFavorite(p.id)}
                    onAddToCart={() => handleAddToCart(p)}
                    viewMode={viewMode} />
                ))}
              </div>
              {/* Infinite scroll sentinel */}
              <div ref={loadMoreRef} style={{ height: "20px", margin: "20px 0" }} />
              {hasMore && (
                <div className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>Se încarcă mai multe produse...</span>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            className={styles.toast}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 32 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          >
            <BsCheckCircleFill size={18} />
            <span>
              <strong>{toast.length > 28 ? toast.slice(0, 28) + "…" : toast}</strong> adăugat în coș!
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ProductCard({ product: p, isFav, onFav, onAddToCart, viewMode, index }: {
  product: Product; isFav: boolean; onFav: () => void;
  onAddToCart: () => void; viewMode: "grid" | "list"; index: number;
}) {
  const t = useTranslations();
  const discount = p.originalPrice
    ? Math.round((1 - p.price / p.originalPrice) * 100) : null;

  return (
    <motion.div
      className={viewMode === "grid" ? styles.card : styles.cardList}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.42, delay: (index % 8) * 0.06, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6 }}
    >
      <Link href={`/produse/${p.id}`} className={styles.cardImgWrap}>
        {discount && <span className={styles.discountBadge}>-{discount}%</span>}
        {p.isNew && <span className={styles.newBadge}>NOU</span>}
        <Image src={p.img} alt={p.name} fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 360px"
          style={{ objectFit: "contain" }} className={styles.cardImg} />
        <button className={styles.favBtn} onClick={(e) => { e.preventDefault(); onFav(); }} aria-label="Favorite">
          {isFav ? <BsHeartFill size={16} color="#FF6FAF" /> : <BsHeart size={16} />}
        </button>
      </Link>
      <div className={styles.cardBody}>
        <span className={styles.cardBrand}>{p.brand}</span>
        <Link href={`/produse/${p.id}`} className={styles.cardNameLink}>
        <h3 className={styles.cardName}>{p.name}</h3>
        </Link>
        <p className={styles.cardDesc}>{p.description}</p>
        <div className={styles.cardRating}>
          <StarRating rating={Math.round(p.rating)} />
          <span className={styles.ratingNum}>{p.rating}</span>
          <span className={styles.reviewCount}>({p.reviews})</span>
        </div>
        <div className={styles.cardFooter}>
          <div className={styles.priceWrap}>
            <span className={styles.price}>{p.price} MDL</span>
            {p.originalPrice && <span className={styles.oldPrice}>{p.originalPrice} MDL</span>}
          </div>
          <button className={styles.addBtn} onClick={onAddToCart}>
            <BsCart3 size={15} />
            <span>{t.productsPage.addToCart}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

