"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BsSearch, BsHeart, BsHeartFill, BsStarFill, BsStar,
  BsChevronDown, BsChevronUp, BsX, BsCart3, BsGrid3X3Gap,
  BsListUl, BsSliders, BsFunnel,
} from "react-icons/bs";
import Navbar from "../components/Navbar";
import { PRODUCTS, CATEGORIES, BRANDS, COUNTRIES, ATTRIBUTES, Product } from "./productsData";
import styles from "./page.module.css";

const SORT_OPTIONS = [
  { value: "featured",   label: "Recomandate" },
  { value: "price-asc",  label: "Preț: Mic → Mare" },
  { value: "price-desc", label: "Preț: Mare → Mic" },
  { value: "rating",     label: "Rating" },
  { value: "new",        label: "Noutăți" },
];

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
  const [search, setSearch]           = useState("");
  const [sortBy, setSortBy]           = useState("featured");
  const [viewMode, setViewMode]       = useState<"grid" | "list">("grid");
  const [favorites, setFavorites]     = useState<number[]>([]);
  const [collapsed, setCollapsed]     = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("Toate");

  const [selCategories, setSelCategories] = useState<string[]>([]);
  const [selBrands, setSelBrands]         = useState<string[]>([]);
  const [selCountries, setSelCountries]   = useState<string[]>([]);
  const [selAttributes, setSelAttributes] = useState<string[]>([]);
  const [priceRange, setPriceRange]       = useState<[number, number]>([0, PRICE_MAX]);
  const [inStockOnly, setInStockOnly]     = useState(false);
  const [currentPage, setCurrentPage]     = useState(1);
  const PER_PAGE = 8;

  const toggleCollapse = (id: string) =>
    setCollapsed((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  const toggleArr = (arr: string[], val: string, set: (v: string[]) => void) =>
    set(arr.includes(val) ? arr.filter((x) => x !== val) : [...arr, val]);

  const toggleFav = (id: number) =>
    setFavorites((p) => p.includes(id) ? p.filter((x) => x !== id) : [...p, id]);

  /* ── Active filter chips ── */
  const chips: { label: string; clear: () => void }[] = [
    ...selCategories.map((c) => ({ label: c, clear: () => setSelCategories((p) => p.filter((x) => x !== c)) })),
    ...selBrands.map((b)     => ({ label: b, clear: () => setSelBrands((p)     => p.filter((x) => x !== b)) })),
    ...selCountries.map((c)  => ({ label: c, clear: () => setSelCountries((p)  => p.filter((x) => x !== c)) })),
    ...selAttributes.map((a) => ({ label: a, clear: () => setSelAttributes((p) => p.filter((x) => x !== a)) })),
    ...(inStockOnly ? [{ label: "În stoc", clear: () => setInStockOnly(false) }] : []),
    ...(priceRange[0] > 0 || priceRange[1] < PRICE_MAX
      ? [{ label: `${priceRange[0]}–${priceRange[1]} MDL`, clear: () => setPriceRange([0, PRICE_MAX]) }]
      : []),
  ];

  const clearAll = () => {
    setSelCategories([]); setSelBrands([]); setSelCountries([]);
    setSelAttributes([]); setInStockOnly(false); setPriceRange([0, PRICE_MAX]);
    setActiveCategory("Toate"); setSearch("");
  };

  /* ── Filtered & sorted products ── */
  const filtered = useMemo(() => {
    let list = PRODUCTS.filter((p) => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase()) &&
          !p.brand.toLowerCase().includes(search.toLowerCase())) return false;
      if (activeCategory !== "Toate" && p.category !== activeCategory) return false;
      if (selCategories.length && !selCategories.includes(p.category)) return false;
      if (selBrands.length    && !selBrands.includes(p.brand))         return false;
      if (selCountries.length && !selCountries.includes(p.country))    return false;
      if (selAttributes.length && !selAttributes.every((a) => p.attributes.includes(a))) return false;
      if (inStockOnly && !p.inStock) return false;
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
  }, [search, activeCategory, selCategories, selBrands, selCountries, selAttributes, inStockOnly, priceRange, sortBy]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated  = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <div className={styles.page}>
      <Navbar />

      {/* ── Hero bar ── */}
      <div className={styles.heroBar}>
        <div className={styles.heroBarInner}>
          <nav className={styles.breadcrumb} aria-label="Breadcrumb">
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Produse</span>
          </nav>
          <motion.h1
            className={styles.pageTitle}
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            Toate Produsele
          </motion.h1>
          <motion.p
            className={styles.pageSubtitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            Peste {filtered.length} bunătăți dulci gata să-ți bucure ziua
          </motion.p>
        </div>
      </div>

      {/* ── Category tabs ── */}
      <div className={styles.catBar}>
        <div className={styles.catBarInner}>
          {["Toate", ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              className={`${styles.catTab} ${activeCategory === cat ? styles.catTabActive : ""}`}
              onClick={() => { setActiveCategory(cat); setCurrentPage(1); }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.layout}>

        {/* SIDEBAR */}
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHeader}>
            <BsSliders size={16} />
            <span>Filtre</span>
            {chips.length > 0 && (
              <button className={styles.clearAll} onClick={clearAll}>Șterge tot</button>
            )}
          </div>

          <FilterSection title="Categorie" id="cat" collapsed={collapsed.includes("cat")} toggle={toggleCollapse}>
            {CATEGORIES.map((c) => (
              <label key={c} className={styles.checkRow}>
                <input type="checkbox" checked={selCategories.includes(c)}
                  onChange={() => { toggleArr(selCategories, c, setSelCategories); setCurrentPage(1); }} />
                <span>{c}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Brand" id="brand" collapsed={collapsed.includes("brand")} toggle={toggleCollapse}>
            {BRANDS.map((b) => (
              <label key={b} className={styles.checkRow}>
                <input type="checkbox" checked={selBrands.includes(b)}
                  onChange={() => { toggleArr(selBrands, b, setSelBrands); setCurrentPage(1); }} />
                <span>{b}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Preț (MDL)" id="price" collapsed={collapsed.includes("price")} toggle={toggleCollapse}>
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

          <FilterSection title="Disponibilitate" id="stock" collapsed={collapsed.includes("stock")} toggle={toggleCollapse}>
            <label className={styles.checkRow}>
              <input type="checkbox" checked={inStockOnly}
                onChange={() => { setInStockOnly((p) => !p); setCurrentPage(1); }} />
              <span>Doar în stoc</span>
            </label>
          </FilterSection>

          <FilterSection title="Țara de origine" id="country" collapsed={collapsed.includes("country")} toggle={toggleCollapse}>
            {COUNTRIES.map((c) => (
              <label key={c} className={styles.checkRow}>
                <input type="checkbox" checked={selCountries.includes(c)}
                  onChange={() => { toggleArr(selCountries, c, setSelCountries); setCurrentPage(1); }} />
                <span>{c}</span>
              </label>
            ))}
          </FilterSection>

          <FilterSection title="Atribute" id="attr" collapsed={collapsed.includes("attr")} toggle={toggleCollapse}>
            {ATTRIBUTES.map((a) => (
              <label key={a} className={styles.checkRow}>
                <input type="checkbox" checked={selAttributes.includes(a)}
                  onChange={() => { toggleArr(selAttributes, a, setSelAttributes); setCurrentPage(1); }} />
                <span>{a}</span>
              </label>
            ))}
          </FilterSection>
        </aside>

        {/* MAIN */}
        <main className={styles.main}>

          {/* Toolbar */}
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <BsSearch className={styles.searchIcon} size={16} />
              <input
                className={styles.searchInput}
                placeholder="Caută produse..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              />
            </div>
            <div className={styles.toolbarRight}>
              <span className={styles.countLabel}>{filtered.length} produse</span>
              <div className={styles.sortWrap}>
                <BsFunnel size={14} />
                <select className={styles.sortSelect} value={sortBy}
                  onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}>
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
              <button className={styles.chipClear} onClick={clearAll}>Șterge tot</button>
            </div>
          )}

          {/* Product grid/list */}
          {paginated.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}><BsSearch size={40} /></span>
              <p>Nu am găsit produse pentru filtrele selectate.</p>
              <button className={styles.clearAll} onClick={clearAll}>Resetează filtrele</button>
            </div>
          ) : (
            <div className={viewMode === "grid" ? styles.grid : styles.listView}>
              {paginated.map((p, i) => (
                <ProductCard key={p.id} index={i} product={p}
                  isFav={favorites.includes(p.id)} onFav={() => toggleFav(p.id)}
                  viewMode={viewMode} />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button className={styles.pageBtn} disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => p - 1)}>‹</button>
              {Array.from({ length: totalPages }).map((_, i) => (
                <button key={i}
                  className={`${styles.pageBtn} ${currentPage === i + 1 ? styles.pageBtnActive : ""}`}
                  onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
              ))}
              <button className={styles.pageBtn} disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((p) => p + 1)}>›</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

function ProductCard({ product: p, isFav, onFav, viewMode, index }: {
  product: Product; isFav: boolean; onFav: () => void; viewMode: "grid" | "list"; index: number;
}) {
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
      <div className={styles.cardImgWrap}>
        {discount && <span className={styles.discountBadge}>-{discount}%</span>}
        {p.isNew && <span className={styles.newBadge}>NOU</span>}
        {!p.inStock && <div className={styles.outOfStock}>Indisponibil</div>}
        <Image src={p.img} alt={p.name} fill
          sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, (max-width: 1280px) 33vw, 360px"
          style={{ objectFit: "cover" }} className={styles.cardImg} />
        <button className={styles.favBtn} onClick={onFav} aria-label="Favorite">
          {isFav ? <BsHeartFill size={16} color="#FF6FAF" /> : <BsHeart size={16} />}
        </button>
      </div>
      <div className={styles.cardBody}>
        <span className={styles.cardBrand}>{p.brand}</span>
        <h3 className={styles.cardName}>{p.name}</h3>
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
          <button className={styles.addBtn} disabled={!p.inStock}>
            <BsCart3 size={15} />
            <span>{p.inStock ? "Adaugă" : "Epuizat"}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

