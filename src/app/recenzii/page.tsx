"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsStarFill, BsStar, BsSearch, BsCheckCircleFill, BsHandThumbsUp,
  BsFunnel, BsChevronDown, BsChevronLeft, BsChevronRight, BsQuote,
} from "react-icons/bs";
import Footer from "../components/Footer";
import { REVIEWS, PRODUCTS_LIST, Review } from "./reviewsData";
import { useTranslations } from "../context/LanguageContext";
import styles from "./page.module.css";

const SORT_VALUES = ["newest", "oldest", "highest", "helpful"] as const;

const PER_PAGE = 6;

function Stars({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <span className={styles.stars}>
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} style={{ color: rating >= s ? "#FFB400" : "#E2E5E9", display: "inline-flex" }}>
          {rating >= s ? <BsStarFill size={size} /> : <BsStar size={size} />}
        </span>
      ))}
    </span>
  );
}

function AnimatedCounter({ value, decimals = 0, duration = 1400 }: {
  value: number; decimals?: number; duration?: number;
}) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{display.toFixed(decimals)}</>;
}

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 120 : -120, scale: 0.94 }),
  center: { opacity: 1, x: 0, scale: 1 },
  exit:  (dir: number) => ({ opacity: 0, x: dir > 0 ? -120 : 120, scale: 0.94 }),
};

function FeaturedCarousel({ reviews }: { reviews: Review[] }) {
  const [[index, dir], setState] = useState<[number, number]>([0, 0]);
  const [paused, setPaused] = useState(false);
  const count = reviews.length;

  const paginate = useCallback((step: number) => {
    setState(([i]) => [(i + step + count) % count, step]);
  }, [count]);

  useEffect(() => {
    if (paused || count <= 1) return;
    const t = setInterval(() => paginate(1), 5500);
    return () => clearInterval(t);
  }, [paused, paginate, count]);

  if (count === 0) return null;
  const r = reviews[index];

  return (
    <div
      className={styles.carousel}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <button className={`${styles.carArrow} ${styles.carArrowLeft}`}
        onClick={() => paginate(-1)} aria-label="Recenzia anterioară">
        <BsChevronLeft size={20} />
      </button>

      <div className={styles.carViewport}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.article
            key={r.id}
            className={styles.carCard}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.18}
            onDragEnd={(_, info) => {
              if (info.offset.x < -80) paginate(1);
              else if (info.offset.x > 80) paginate(-1);
            }}
          >
            <span className={styles.carQuoteIcon}><BsQuote size={64} /></span>
            <Stars rating={r.rating} size={22} />
            <p className={styles.carText}>{r.text}</p>
            <div className={styles.carPerson}>
              <span className={styles.carAvatar} style={{ background: r.avatarColor }}>
                {r.initials}
              </span>
              <div className={styles.carPersonMeta}>
                <span className={styles.carName}>
                  {r.name}
                  {r.verified && <BsCheckCircleFill size={13} className={styles.carVerified} />}
                </span>
                <span className={styles.carProduct}>{r.product} · {r.dateLabel}</span>
              </div>
            </div>
          </motion.article>
        </AnimatePresence>
      </div>

      <button className={`${styles.carArrow} ${styles.carArrowRight}`}
        onClick={() => paginate(1)} aria-label="Recenzia următoare">
        <BsChevronRight size={20} />
      </button>

      <div className={styles.carDots}>
        {reviews.map((_, i) => (
          <button
            key={i}
            className={`${styles.carDot} ${i === index ? styles.carDotActive : ""}`}
            onClick={() => setState(([cur]) => [i, i > cur ? 1 : -1])}
            aria-label={`Recenzia ${i + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default function RecenziiPage() {
  const t = useTranslations();
  const [search, setSearch]           = useState("");

  const SORT_OPTIONS = [
    { value: "newest",  label: t.reviewsPage.sortNewest },
    { value: "oldest",  label: t.reviewsPage.sortOldest },
    { value: "highest", label: t.reviewsPage.sortHighest },
    { value: "helpful", label: t.reviewsPage.sortHelpful },
  ];
  const [sortBy, setSortBy]           = useState("newest");
  const [ratingFilter, setRatingFilter] = useState<number | null>(null);
  const [productFilter, setProductFilter] = useState("Toate");
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [page, setPage]               = useState(1);

  const total = REVIEWS.length;
  const average = useMemo(
    () => REVIEWS.reduce((a, r) => a + r.rating, 0) / total,
    [total]
  );

  const breakdown = useMemo(() => {
    const counts = [0, 0, 0, 0, 0];
    REVIEWS.forEach((r) => counts[r.rating - 1]++);
    return counts;
  }, []);

  const featured = useMemo(
    () => [...REVIEWS]
      .filter((r) => r.rating === 5)
      .sort((a, b) => b.helpful - a.helpful)
      .slice(0, 6),
    []
  );

  const verifiedCount = useMemo(() => REVIEWS.filter((r) => r.verified).length, []);
  const recommendPct = Math.round((breakdown[4] + breakdown[3]) / total * 100);

  const filtered = useMemo(() => {
    let list = REVIEWS.filter((r) => {
      if (ratingFilter && r.rating !== ratingFilter) return false;
      if (productFilter !== "Toate" && r.product !== productFilter) return false;
      if (verifiedOnly && !r.verified) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!r.text.toLowerCase().includes(q) &&
            !r.name.toLowerCase().includes(q) &&
            !r.product.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    switch (sortBy) {
      case "newest":  list = [...list].sort((a, b) => b.date.localeCompare(a.date)); break;
      case "oldest":  list = [...list].sort((a, b) => a.date.localeCompare(b.date)); break;
      case "highest": list = [...list].sort((a, b) => b.rating - a.rating || b.date.localeCompare(a.date)); break;
      case "helpful": list = [...list].sort((a, b) => b.helpful - a.helpful); break;
    }
    return list;
  }, [search, sortBy, ratingFilter, productFilter, verifiedOnly]);

  const totalPages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetPage = () => setPage(1);

  return (
    <div className={styles.page}>
      {/* ── Hero header ── */}
      <div className={styles.header}>
        <span className={`${styles.blob} ${styles.blobA}`} aria-hidden="true" />
        <span className={`${styles.blob} ${styles.blobB}`} aria-hidden="true" />
        <span className={`${styles.blob} ${styles.blobC}`} aria-hidden="true" />
        <div className={styles.headerInner}>
          <motion.nav className={styles.breadcrumb}
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
            <Link href="/">{t.reviewsPage.breadcrumbHome}</Link>
            <span>/</span>
            <span>{t.reviewsPage.breadcrumbReviews}</span>
          </motion.nav>
          <motion.span className={styles.headerPill}
            initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, delay: 0.05 }}>
            <BsStarFill size={12} /> {average.toFixed(1)} din 5 · {total} recenzii
          </motion.span>
          <motion.h1 className={styles.title}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            {t.reviewsPage.pageTitle}<br /><span className={styles.titleAccent}>{t.reviewsPage.pageTitleAccent}</span>
          </motion.h1>
          <motion.p className={styles.subtitle}
            initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.16 }}>
            {t.reviewsPage.pageSubtitle}
          </motion.p>

          {/* Featured carousel */}
          <motion.div
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <FeaturedCarousel reviews={featured} />
          </motion.div>
        </div>
      </div>

      {/* ── Stats band ── */}
      <div className={styles.statsBand}>
        <motion.div className={styles.statCard}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5 }}>
          <span className={styles.statNum}><AnimatedCounter value={average} decimals={1} /></span>
          <Stars rating={Math.round(average)} size={15} />
          <span className={styles.statLabel}>{t.reviewsPage.statAvgRating}</span>
        </motion.div>
        <motion.div className={styles.statCard}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.08 }}>
          <span className={styles.statNum}><AnimatedCounter value={total} /></span>
          <span className={styles.statLabel}>{t.reviewsPage.statTotal}</span>
        </motion.div>
        <motion.div className={styles.statCard}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.16 }}>
          <span className={styles.statNum}><AnimatedCounter value={recommendPct} />%</span>
          <span className={styles.statLabel}>{t.reviewsPage.statRecommend}</span>
        </motion.div>
        <motion.div className={styles.statCard}
          initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.5, delay: 0.24 }}>
          <span className={styles.statNum}><AnimatedCounter value={verifiedCount} /></span>
          <span className={styles.statLabel}>{t.reviewsPage.statVerified}</span>
        </motion.div>
      </div>

      <div className={styles.layout}>
        {/* ── Summary card ── */}
        <section className={styles.summary}>
          <div className={styles.summaryScore}>
            <span className={styles.bigScore}>{average.toFixed(1)}</span>
            <Stars rating={Math.round(average)} size={18} />
            <span className={styles.totalReviews}>{total} {t.reviewsPage.breadcrumbReviews}</span>
          </div>
          <div className={styles.breakdown}>
            {[5, 4, 3, 2, 1].map((star) => {
              const count = breakdown[star - 1];
              const pct = total ? (count / total) * 100 : 0;
              const active = ratingFilter === star;
              return (
                <button
                  key={star}
                  className={`${styles.breakdownRow} ${active ? styles.breakdownActive : ""}`}
                  onClick={() => { setRatingFilter(active ? null : star); resetPage(); }}
                >
                  <span className={styles.breakdownLabel}>{star} <BsStarFill size={11} /></span>
                  <span className={styles.barTrack}>
                    <motion.span className={styles.barFill}
                      initial={{ width: 0 }} whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }} transition={{ duration: 0.8, ease: "easeOut" }} />
                  </span>
                  <span className={styles.breakdownCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Section heading ── */}
        <h2 className={styles.sectionHeading}>{t.reviewsPage.sectionAllReviews}</h2>

        {/* ── Toolbar ── */}
        <section className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <BsSearch className={styles.searchIcon} size={16} />
            <input
              className={styles.searchInput}
              placeholder={t.reviewsPage.searchPlaceholder}
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            />
          </div>
          <div className={styles.toolbarControls}>
            <div className={styles.selectWrap}>
              <span className={styles.selectLabel}>{t.reviewsPage.productFilterLabel}</span>
              <select className={styles.select} value={productFilter}
                onChange={(e) => { setProductFilter(e.target.value); resetPage(); }}>
                <option value="Toate">{t.reviewsPage.allProducts}</option>
                {PRODUCTS_LIST.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <BsChevronDown size={12} className={styles.selectChevron} />
            </div>
            <div className={styles.selectWrap}>
              <BsFunnel size={13} className={styles.sortIcon} />
              <select className={styles.select} value={sortBy}
                onChange={(e) => { setSortBy(e.target.value); resetPage(); }}>
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
              <BsChevronDown size={12} className={styles.selectChevron} />
            </div>
            <label className={`${styles.verifiedToggle} ${verifiedOnly ? styles.verifiedActive : ""}`}>
              <input type="checkbox" checked={verifiedOnly}
                onChange={() => { setVerifiedOnly((p) => !p); resetPage(); }} />
              <BsCheckCircleFill size={14} />
              <span>{t.reviewsPage.verifiedOnly}</span>
            </label>
          </div>
        </section>

        {/* ── Active filter note ── */}
        {(ratingFilter || productFilter !== "Toate" || verifiedOnly || search) && (
          <div className={styles.resultNote}>
            <span>{t.reviewsPage.resultNote.replace("{count}", String(filtered.length))}</span>
            <button className={styles.clearLink} onClick={() => {
              setRatingFilter(null); setProductFilter("Toate");
              setVerifiedOnly(false); setSearch(""); resetPage();
            }}>{t.reviewsPage.resetFilters}</button>
          </div>
        )}

        {/* ── Reviews list ── */}
        {paginated.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>💬</span>
            <p>Nicio recenzie nu corespunde filtrelor selectate.</p>
          </div>
        ) : (
          <div className={styles.reviewList}>
            {paginated.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 26 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: (i % PER_PAGE) * 0.06, ease: [0.22, 1, 0.36, 1] }}
              >
                <ReviewCard review={r} />
              </motion.div>
            ))}
          </div>
        )}

        {/* ── Pagination ── */}
        {totalPages > 1 && (
          <div className={styles.pagination}>
            <button className={styles.pageBtn} disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}>‹</button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button key={i}
                className={`${styles.pageBtn} ${page === i + 1 ? styles.pageBtnActive : ""}`}
                onClick={() => setPage(i + 1)}>{i + 1}</button>
            ))}
            <button className={styles.pageBtn} disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}>›</button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}

function ReviewCard({ review: r }: { review: Review }) {
  const t = useTranslations();
  const [helpful, setHelpful] = useState(r.helpful);
  const [voted, setVoted]     = useState(false);

  const vote = () => {
    setHelpful((h) => (voted ? h - 1 : h + 1));
    setVoted((v) => !v);
  };

  return (
    <article className={styles.card}>
      <div className={styles.cardHead}>
        <div className={styles.avatar} style={{ background: r.avatarColor }}>
          {r.initials}
        </div>
        <div className={styles.cardMeta}>
          <div className={styles.nameRow}>
            <span className={styles.name}>{r.name}</span>
            {r.verified && (
              <span className={styles.verifiedBadge}>
                <BsCheckCircleFill size={12} /> {t.reviewsPage.verifiedBadge}
              </span>
            )}
          </div>
          <div className={styles.subRow}>
            <Stars rating={r.rating} />
            <span className={styles.dot}>·</span>
            <span className={styles.date}>{r.dateLabel}</span>
          </div>
        </div>
      </div>

      <span className={styles.productTag}>{r.product}</span>
      <p className={styles.reviewText}>{r.text}</p>

      {r.photos.length > 0 && (
        <div className={styles.photos}>
          {r.photos.map((src, i) => (
            <div key={i} className={styles.photoWrap}>
              <Image src={src} alt={`Foto recenzie ${i + 1}`} fill sizes="90px"
                style={{ objectFit: "cover" }} />
            </div>
          ))}
        </div>
      )}

      <div className={styles.cardFooter}>
        <button className={`${styles.helpfulBtn} ${voted ? styles.helpfulVoted : ""}`} onClick={vote}>
          <BsHandThumbsUp size={14} />
          <span>{t.reviewsPage.helpfulBtn} ({helpful})</span>
        </button>
      </div>
    </article>
  );
}
