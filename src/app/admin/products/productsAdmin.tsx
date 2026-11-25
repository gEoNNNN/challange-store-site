"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  BsBoxSeam, BsCheckCircleFill, BsGrid3X3Gap, BsImage, BsListUl, BsSearch, BsX,
} from "react-icons/bs";
import styles from "../admin.module.css";

interface AdminProduct {
  uid: string;
  name: string;
  source_name: string | null;
  brand: string | null;
  category: string | null;
  price: string | number;
  promotion_price: string | number;
  depot_stock: string | number;
  image_url: string | null;
  has_image: boolean;
  description_length: number;
}

interface SearchImage {
  url: string;
  title: string;
  source: string;
  width: number;
  height: number;
}

const PAGE_SIZE = 40;

/** Trimite tokenul de sesiune în header; cookie-ul httpOnly rămâne sursa principală. */
function authHeaders(token: string): HeadersInit {
  return token ? { authorization: `Bearer ${token}` } : {};
}

export default function AdminProducts() {
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loggingIn, setLoggingIn] = useState(false);
  // Tokenul de sesiune merge și în header, ca fetch-urile să funcționeze peste tot.
  const [token, setToken] = useState("");

  const [items, setItems] = useState<AdminProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<"grid" | "list">("grid");

  const [activeUid, setActiveUid] = useState<string | null>(null);
  const [images, setImages] = useState<SearchImage[]>([]);
  const [searching, setSearching] = useState(false);
  const [savingUid, setSavingUid] = useState<string | null>(null);
  const [toast, setToast] = useState<{ text: string; ok: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/admin/products?limit=1", { credentials: "same-origin" })
      .then((response) => {
        setAuthorized(response.status !== 401);
        // Cookie-ul e httpOnly: nu-l putem citi din JS, deci cerem un token de sesiune.
        if (response.status !== 401) {
          return fetch("/api/admin/session", { method: "POST", credentials: "same-origin" })
            .then((r) => (r.ok ? r.json() : null))
            .then((data) => setToken(data?.session ?? ""))
            .catch(() => {});
        }
      })
      .catch(() => setAuthorized(false));
  }, []);

  const loadProducts = useCallback(async (nextOffset: number, replace: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(nextOffset) });
      if (query) params.set("search", query);
      const response = await fetch(`/api/admin/products?${params}`, { headers: authHeaders(token) });
      if (response.status === 401) { setAuthorized(false); return; }
      const data = await response.json();
      setItems((prev) => (replace ? data.items : [...prev, ...data.items]));
      setTotal(data.total);
      setOffset(nextOffset);
    } catch {
      setToast({ text: "Nu am putut încărca produsele.", ok: false });
    } finally {
      setLoading(false);
    }
  }, [query]);

  useEffect(() => {
    if (authorized) loadProducts(0, true);
  }, [authorized, loadProducts]);

  const active = useMemo(() => items.find((item) => item.uid === activeUid) ?? null, [items, activeUid]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setLoggingIn(true);
    setLoginError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setLoginError(data.error ?? "Autentificare eșuată.");
        return;
      }
      setAuthorized(true);
      setToken(data.session ?? "");
      setPassword("");
    } catch {
      setLoginError("Autentificare eșuată.");
    } finally {
      setLoggingIn(false);
    }
  }

  async function logout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthorized(false);
    setToken("");
    setItems([]);
  }

  async function searchImages(product: AdminProduct) {
    setActiveUid(product.uid);
    setSearching(true);
    setImages([]);
    try {
      const response = await fetch(`/api/admin/image-search?q=${encodeURIComponent(product.source_name || product.name)}`, {
        headers: authHeaders(token),
      });
      const data = await response.json();
      if (!response.ok) {
        setToast({ text: data.error ?? "Căutarea a eșuat.", ok: false });
        return;
      }
      setImages(data.images ?? []);
    } catch {
      setToast({ text: "Căutarea a eșuat.", ok: false });
    } finally {
      setSearching(false);
    }
  }

  async function saveImage(product: AdminProduct, imageUrl: string) {
    setSavingUid(product.uid);
    try {
      const response = await fetch("/api/admin/product-image", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeaders(token) },
        body: JSON.stringify({ uid: product.uid, imageUrl }),
      });
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setToast({ text: data.error ?? "Salvarea a eșuat.", ok: false });
        return;
      }
      setItems((prev) => prev.map((item) => (item.uid === product.uid ? { ...item, image_url: data.imageUrl, has_image: true } : item)));
      setToast({ text: "Imaginea a fost actualizată.", ok: true });
      setActiveUid(null);
    } catch {
      setToast({ text: "Salvarea a eșuat.", ok: false });
    } finally {
      setSavingUid(null);
    }
  }

  if (authorized === null) {
    return <div className={styles.loading}>Se verifică accesul…</div>;
  }

  if (!authorized) {
    return (
      <div className={styles.loginWrap}>
        <form className={styles.loginCard} onSubmit={login}>
          <h1 className={styles.loginTitle}>Panou administrativ</h1>
          <p className={styles.loginHint}>Introdu parola de administrator.</p>
          <input
            className={styles.loginInput}
            type="password"
            placeholder="Parolă"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoFocus
          />
          {loginError && <p className={styles.loginError}>{loginError}</p>}
          <button className={styles.loginButton} type="submit" disabled={loggingIn}>
            {loggingIn ? "Se verifică…" : "Intră"}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>
          <BsBoxSeam size={22} /> Produse
        </h1>
        <div className={styles.headerRight}>
          <span className={styles.total}>{total} produse</span>
          <button className={styles.logout} onClick={logout}>Ieșire</button>
        </div>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchWrap}>
          <BsSearch size={16} className={styles.searchIcon} />
          <input
            className={styles.searchInput}
            placeholder="Caută produs…"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") { setQuery(search.trim()); setOffset(0); loadProducts(0, true); }
            }}
          />
          {search && (
            <button
              className={styles.clearSearch}
              onClick={() => { setSearch(""); setQuery(""); loadProducts(0, true); }}
              aria-label="Șterge căutarea"
            >
              <BsX size={14} />
            </button>
          )}
        </div>
        <button className={styles.searchBtn} onClick={() => { setQuery(search.trim()); loadProducts(0, true); }}>
          Caută
        </button>
        <div className={styles.viewToggle}>
          <button className={`${styles.viewBtn} ${view === "grid" ? styles.viewBtnActive : ""}`} onClick={() => setView("grid")} aria-label="Grid">
            <BsGrid3X3Gap size={16} />
          </button>
          <button className={`${styles.viewBtn} ${view === "list" ? styles.viewBtnActive : ""}`} onClick={() => setView("list")} aria-label="Listă">
            <BsListUl size={16} />
          </button>
        </div>
      </div>

      {items.length === 0 && !loading ? (
        <p className={styles.empty}>Niciun produs găsit.</p>
      ) : (
        <div className={view === "grid" ? styles.grid : styles.list}>
          {items.map((product) => (
            <article key={product.uid} className={styles.card}>
              <div className={styles.thumb}>
                {product.has_image || product.image_url ? (
                  <Image src={product.image_url ?? "/img/candypack.png"} alt={product.name} fill sizes="220px" style={{ objectFit: "contain" }} />
                ) : (
                  <span className={styles.noImage}>fără imagine</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <h2 className={styles.cardName}>{product.name}</h2>
                <p className={styles.cardMeta}>
                  {product.brand || "—"} · {Number(product.price).toFixed(2)} lei · stoc {Number(product.depot_stock).toFixed(0)}
                </p>
                <p className={styles.cardDesc}>
                  {product.description_length > 0 ? `${product.description_length} caractere descriere` : "fără descriere"}
                </p>
                <button className={styles.replaceBtn} onClick={() => searchImages(product)} disabled={searching && activeUid === product.uid}>
                  <BsImage size={15} />
                  {activeUid === product.uid && searching ? "Se caută…" : "Schimbă imaginea"}
                </button>
              </div>

              {activeUid === product.uid && (
                <div className={styles.picker}>
                  <div className={styles.pickerHead}>
                    <span>Imagini de pe net</span>
                    <button className={styles.pickerClose} onClick={() => { setActiveUid(null); setImages([]); }} aria-label="Închide">
                      <BsX size={15} />
                    </button>
                  </div>
                  {searching && <p className={styles.pickerLoading}>Se caută imagini…</p>}
                  {!searching && images.length === 0 && <p className={styles.pickerLoading}>Nicio imagine găsită.</p>}
                  <div className={styles.pickerGrid}>
                    {images.map((image) => (
                      <button
                        key={image.url}
                        className={styles.pickerItem}
                        onClick={() => saveImage(product, image.url)}
                        disabled={savingUid === product.uid}
                        title={image.title || image.source}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={image.url} alt={image.title || "imagine"} loading="lazy" />
                        {savingUid === product.uid && <span className={styles.saving}>Se salvează…</span>}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </article>
          ))}
        </div>
      )}

      {items.length < total && (
        <button className={styles.loadMore} onClick={() => loadProducts(offset + PAGE_SIZE, false)} disabled={loading}>
          {loading ? "Se încarcă…" : `Încarcă mai multe (${items.length}/${total})`}
        </button>
      )}

      {toast && (
        <div className={`${styles.toast} ${toast.ok ? styles.toastOk : styles.toastErr}`}>
          <BsCheckCircleFill size={16} /> {toast.text}
          <button className={styles.toastClose} onClick={() => setToast(null)} aria-label="Închide"><BsX size={13} /></button>
        </div>
      )}
    </div>
  );
}
