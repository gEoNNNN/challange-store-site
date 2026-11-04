"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsTrash, BsDash, BsPlus, BsCheckCircleFill,
  BsBag, BsArrowLeft, BsTruck, BsShield, BsTelephone,
  BsCashCoin, BsCreditCard2Front, BsQrCode,
} from "react-icons/bs";
import { useCart } from "../context/CartContext";
import { useLanguage } from "../context/LanguageContext";
import { ordersEnabled } from "../../lib/siteLock";
import styles from "./page.module.css";

// Next staticly replaces the NEXT_PUBLIC_ env at build time, so this is safe client-side.
const ORDERS_OPEN = ordersEnabled();

interface FormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

type OrderResponse = {
  ok: boolean;
  code?: string;
  total?: number;
  paymentMethod?: "cod" | "maib";
  checkoutUrl?: string;
  error?: string;
};

export default function CheckoutPage() {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart();
  const { locale } = useLanguage();

  const [form, setForm] = useState<FormData>({
    name: "", email: "", phone: "", address: "", city: "", notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "maib">("maib");
  const [orderNum] = useState(() => Math.floor(10000 + Math.random() * 90000));
  const [orderCode, setOrderCode] = useState<string | null>(null);

  const SHIPPING = totalPrice >= 500 ? 0 : 50;
  const TOTAL = totalPrice + SHIPPING;

  function validate() {
    const e: Partial<FormData> = {};
    const email = form.email.trim();
    if (form.name.trim().length < 2) e.name = "Introdu un nume valid";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) e.email = "Introdu o adresă de email validă";
    if (!/^\+?[0-9 ()-]{7,24}$/.test(form.phone.trim())) e.phone = "Introdu un număr de telefon valid";
    if (form.address.trim().length < 5) e.address = "Introdu adresa completă";
    if (form.city.trim().length < 2) e.city = "Introdu localitatea";
    if (form.notes.length > 500) e.notes = "Maximum 500 de caractere";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!ORDERS_OPEN) return;
    setSubmitError("");
    if (!validate()) return;

    const lines = items
      .filter((i) => !!i.product.uid)
      .map((i) => ({ uid: i.product.uid as string, qty: i.qty }));
    if (lines.length !== items.length || lines.length === 0) {
      setSubmitError("Coșul conține un produs care nu mai poate fi comandat. Elimină-l și încearcă din nou.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phone: form.phone,
          email: form.email,
          address: form.address,
          city: form.city,
          name: form.name,
          comment: form.notes,
          paymentMethod,
          language: locale,
          items: lines,
        }),
      });
      const data = await res.json() as OrderResponse;
      if (!res.ok || !data.ok || !data.code) {
        setSubmitError(data.error || "Comanda nu a putut fi procesată. Încearcă din nou.");
        return;
      }
      if (paymentMethod === "maib") {
        if (!data.checkoutUrl) {
          setSubmitError("Pagina securizată de plată nu a putut fi deschisă.");
          return;
        }
        window.location.assign(data.checkoutUrl);
        return;
      }
      setOrderCode(data.code);
      clearCart();
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      setSubmitError("Nu ne-am putut conecta la server. Verifică conexiunea și încearcă din nou.");
    } finally {
      setSubmitting(false);
    }
  }

  /* ── Success state ── */
  if (submitted) {
    return (
      <div className={styles.successPage}>
        <motion.div
          className={styles.successCard}
          initial={{ opacity: 0, scale: 0.88 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className={styles.successIconWrap}>
            <BsCheckCircleFill size={56} color="#01934A" />
          </div>
          <h1 className={styles.successTitle}>Comandă plasată!</h1>
          <p className={styles.successSub}>
            Comanda <strong>#{orderCode ?? orderNum}</strong> a fost înregistrată cu succes.
            Te vom contacta în cel mai scurt timp pentru confirmare.
          </p>
          <div className={styles.successMeta}>
            <div className={styles.successMetaItem}>
              <BsTruck size={20} className={styles.successMetaIcon} />
              <div>
                <span>Livrare</span>
                <strong>1–3 zile lucrătoare</strong>
              </div>
            </div>
            <div className={styles.successMetaItem}>
              <BsTelephone size={20} className={styles.successMetaIcon} />
              <div>
                <span>Confirmare</span>
                <strong>Prin apel telefonic</strong>
              </div>
            </div>
          </div>
          <Link href="/produse" className={styles.successBtn}>
            Continuă cumpărăturile
          </Link>
        </motion.div>
      </div>
    );
  }

  /* ── Empty cart ── */
  if (items.length === 0) {
    return (
      <div className={styles.emptyPage}>
        <motion.div
          className={styles.emptyCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
        >
          <BsBag size={64} className={styles.emptyIcon} />
          <h2>Coșul tău este gol</h2>
          <p>Adaugă produse din catalogul nostru pentru a plasa o comandă.</p>
          <Link href="/produse" className={styles.emptyBtn}>
            Explorează produse
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={styles.page}>

      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/produse" className={styles.backBtn}>
            <BsArrowLeft size={15} /> Înapoi la produse
          </Link>
          <div className={styles.headerTitle}>
            <span className={styles.eyebrow}>Checkout securizat</span>
            <h1>Ultimul pas până la bunătăți</h1>
            <p>Verifică produsele și completează datele pentru livrare.</p>
          </div>
          <div className={styles.checkoutSteps} aria-label="Progres comandă">
            <span className={styles.stepDone}><b>1</b> Coș</span>
            <span className={styles.stepLine} />
            <span className={styles.stepActive}><b>2</b> Livrare</span>
            <span className={styles.stepLine} />
            <span><b>3</b> Confirmare</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.layout}>

        {/* LEFT — cart items */}
        <div className={styles.cartCol}>
          <div className={styles.colHeader}>
            <span className={styles.sectionIndex}>01</span>
            <div>
              <h2>Coșul tău</h2>
              <p>{items.reduce((sum, item) => sum + item.qty, 0)} produse pregătite pentru comandă</p>
            </div>
          </div>

          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product.uid ?? item.product.id}
                className={styles.cartItem}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <Link href={`/produse/${item.product.uid ?? item.product.id}`} className={styles.itemImgLink}>
                  <div className={styles.itemImg}>
                    <Image
                      src={item.product.img}
                      alt={item.product.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                </Link>
                <div className={styles.itemInfo}>
                  <span className={styles.itemBrand}>{item.product.brand}</span>
                  <Link href={`/produse/${item.product.uid ?? item.product.id}`} className={styles.itemName}>
                    {item.product.name}
                  </Link>
                  <span className={styles.itemUnitPrice}>{item.product.price} MDL / buc.</span>
                </div>
                <div className={styles.itemQty}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQty(item.product.uid ?? item.product.id, item.qty - 1)}
                  >
                    <BsDash size={14} />
                  </button>
                  <span className={styles.qtyVal}>{item.qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQty(item.product.uid ?? item.product.id, item.qty + 1)}
                    disabled={item.product.remain !== undefined && item.qty >= item.product.remain}
                  >
                    <BsPlus size={14} />
                  </button>
                </div>
                <div className={styles.itemRight}>
                  <strong className={styles.itemTotal}>
                    {item.product.price * item.qty} MDL
                  </strong>
                  <button
                    className={styles.removeBtn}
                    onClick={() => removeFromCart(item.product.uid ?? item.product.id)}
                    aria-label="Șterge"
                  >
                    <BsTrash size={15} />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* RIGHT — form + summary */}
        <div className={styles.formCol}>

          {/* Order summary */}
          <div className={styles.summaryBox}>
            <div className={styles.summaryHeading}>
              <span className={styles.sectionIndex}>02</span>
              <div><span>Sumar</span><h2>Total comandă</h2></div>
            </div>
            <div className={styles.summaryRow}>
              <span>Subtotal</span>
              <span>{totalPrice} MDL</span>
            </div>
            <div className={styles.summaryRow}>
              <span>Livrare</span>
              <span className={SHIPPING === 0 ? styles.freeShipping : ""}>
                {SHIPPING === 0 ? "Gratuit 🎉" : `${SHIPPING} MDL`}
              </span>
            </div>
            {SHIPPING > 0 && (
              <p className={styles.shippingNote}>
                Livrare în aria Chișinăului · Gratuit la comenzi ≥ 500 MDL
              </p>
            )}
            <div className={styles.summaryDivider} />
            <div className={styles.summaryTotal}>
              <span>Total</span>
              <strong>{TOTAL} MDL</strong>
            </div>
            <div className={styles.trustRow}>
              <span className={styles.trustItem}><BsShield size={13} /> Plată securizată</span>
              <span className={styles.trustItem}><BsTruck size={13} /> Livrare rapidă</span>
            </div>
          </div>

          {/* Delivery form */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <div className={styles.formHeading}>
              <span className={styles.sectionIndex}>03</span>
              <div>
                <span>Destinația comenzii</span>
                <h2>Date de livrare</h2>
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="checkout-name">Nume și prenume *</label>
                <input
                  id="checkout-name"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  placeholder="Ion Popescu"
                  autoComplete="name"
                  maxLength={100}
                  aria-invalid={!!errors.name}
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
                {errors.name && <span className={styles.error}>{errors.name}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="checkout-email">Email *</label>
                <input
                  id="checkout-email"
                  type="email"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  placeholder="ion@email.md"
                  autoComplete="email"
                  maxLength={254}
                  aria-invalid={!!errors.email}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
                {errors.email && <span className={styles.error}>{errors.email}</span>}
              </div>
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="checkout-phone">Număr de telefon *</label>
                <input
                  id="checkout-phone"
                  type="tel"
                  className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                  placeholder="+373 60 000 000"
                  autoComplete="tel"
                  inputMode="tel"
                  maxLength={24}
                  aria-invalid={!!errors.phone}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
                {errors.phone && <span className={styles.error}>{errors.phone}</span>}
              </div>

              <div className={styles.fieldGroup}>
                <label className={styles.label} htmlFor="checkout-city">Localitate *</label>
                <input
                  id="checkout-city"
                  className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                  placeholder="Chișinău"
                  autoComplete="address-level2"
                  maxLength={80}
                  aria-invalid={!!errors.city}
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                {errors.city && <span className={styles.error}>{errors.city}</span>}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label} htmlFor="checkout-address">Adresă de livrare *</label>
              <input
                id="checkout-address"
                className={`${styles.input} ${errors.address ? styles.inputError : ""}`}
                placeholder="Str. Ștefan cel Mare, nr. 1, ap. 5"
                autoComplete="street-address"
                maxLength={200}
                aria-invalid={!!errors.address}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              {errors.address && <span className={styles.error}>{errors.address}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <div className={styles.optionalLabel}>
                <label className={styles.label} htmlFor="checkout-notes">Mențiuni</label>
                <span>{form.notes.length}/500</span>
              </div>
              <textarea
                id="checkout-notes"
                className={`${styles.textarea} ${errors.notes ? styles.inputError : ""}`}
                placeholder="Etaj, interfon sau alte instrucțiuni pentru curier"
                rows={3}
                maxLength={500}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
              {errors.notes && <span className={styles.error}>{errors.notes}</span>}
            </div>

            <fieldset className={styles.paymentFieldset}>
              <legend>Metoda de plată</legend>
              <label className={`${styles.paymentOption} ${paymentMethod === "maib" ? styles.paymentOptionActive : ""}`}>
                <input
                  type="radio"
                  name="payment-method"
                  value="maib"
                  checked={paymentMethod === "maib"}
                  onChange={() => setPaymentMethod("maib")}
                />
                <span className={styles.paymentIcon}><BsCreditCard2Front size={21} /></span>
                <span className={styles.paymentCopy}>
                  <strong>Plată online prin maib</strong>
                  <small><BsQrCode size={12} /> Card bancar sau MIA QR · checkout securizat</small>
                </span>
                <span className={styles.paymentBadge}>Recomandat</span>
              </label>
              <label className={`${styles.paymentOption} ${paymentMethod === "cod" ? styles.paymentOptionActive : ""}`}>
                <input
                  type="radio"
                  name="payment-method"
                  value="cod"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                />
                <span className={styles.paymentIcon}><BsCashCoin size={21} /></span>
                <span className={styles.paymentCopy}>
                  <strong>Plată la livrare</strong>
                  <small>Achită comanda curierului la primire</small>
                </span>
              </label>
            </fieldset>

            {!ORDERS_OPEN && (
              <div className={styles.submitError} role="alert">
                Comenzile sunt temporar suspendate — catalogul poate fi răsfoit, dar plasarea comenzilor va fi activată în curând.
              </div>
            )}
            {submitError && <div className={styles.submitError} role="alert">{submitError}</div>}

            <button type="submit" className={styles.submitBtn} disabled={submitting || !ORDERS_OPEN}>
              {paymentMethod === "maib" ? <BsCreditCard2Front size={18} /> : <BsCheckCircleFill size={17} />}
              {submitting
                ? paymentMethod === "maib" ? "Se deschide plata securizată…" : "Se verifică prețul și stocul…"
                : paymentMethod === "maib" ? `Continuă spre plată — ${TOTAL} MDL` : `Plasează comanda — ${TOTAL} MDL`}
            </button>
            <p className={styles.secureNote}>
              <BsShield size={13} />
              {paymentMethod === "maib"
                ? "Datele de plată sunt procesate direct de maib și nu ajung pe site."
                : "Prețul și stocul sunt reverificate securizat înainte de confirmare."}
            </p>
          </form>

        </div>
      </div>
    </div>
  );
}
