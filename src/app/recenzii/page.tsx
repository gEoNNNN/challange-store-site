"use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  BsStarFill, BsStar, BsSearch, BsCheckCircleFill, BsHandThumbsUp,
  BsFunnel, BsChevronDown,
} from "react-icons/bs";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { REVIEWS, PRODUCTS_LIST, Review } from "./reviewsData";
import styles from "./page.module.css";

const SORT_OPTIONS = [
  { value: "newest",  label: "Cele mai noi" },
  { value: "oldest",  label: "Cele mai vechi" },
  { value: "highest", label: "Cele mai apreciate" },
  { value: "helpful", label: "Cele mai utile" },
];

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

export default function RecenziiPage() {
  const [search, setSearch]           = useState("");
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
      <Navbar />

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <nav className={styles.breadcrumb}>
            <Link href="/">Acasă</Link>
            <span>/</span>
            <span>Recenzii</span>
          </nav>
          <h1 className={styles.title}>Ce spun clienții noștri</h1>
          <p className={styles.subtitle}>
            Recenzii reale de la oameni care au comandat din întreaga lume.
          </p>
        </div>
      </div>

      <div className={styles.layout}>
        {/* ── Summary card ── */}
        <section className={styles.summary}>
          <div className={styles.summaryScore}>
            <span className={styles.bigScore}>{average.toFixed(1)}</span>
            <Stars rating={Math.round(average)} size={18} />
            <span className={styles.totalReviews}>{total} recenzii</span>
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
                    <span className={styles.barFill} style={{ width: `${pct}%` }} />
                  </span>
                  <span className={styles.breakdownCount}>{count}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* ── Toolbar ── */}
        <section className={styles.toolbar}>
          <div className={styles.searchWrap}>
            <BsSearch className={styles.searchIcon} size={16} />
            <input
              className={styles.searchInput}
              placeholder="Caută în recenzii..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); resetPage(); }}
            />
          </div>
          <div className={styles.toolbarControls}>
            <div className={styles.selectWrap}>
              <span className={styles.selectLabel}>Produs</span>
              <select className={styles.select} value={productFilter}
                onChange={(e) => { setProductFilter(e.target.value); resetPage(); }}>
                <option value="Toate">Toate produsele</option>
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
              <span>Doar verificate</span>
            </label>
          </div>
        </section>

        {/* ── Active filter note ── */}
        {(ratingFilter || productFilter !== "Toate" || verifiedOnly || search) && (
          <div className={styles.resultNote}>
            <span>{filtered.length} recenzii găsite</span>
            <button className={styles.clearLink} onClick={() => {
              setRatingFilter(null); setProductFilter("Toate");
              setVerifiedOnly(false); setSearch(""); resetPage();
            }}>Resetează filtrele</button>
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
            {paginated.map((r) => <ReviewCard key={r.id} review={r} />)}
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
                <BsCheckCircleFill size={12} /> Achiziție verificată
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
          <span>Utilă ({helpful})</span>
        </button>
      </div>
    </article>
  );
}
