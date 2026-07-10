"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  BsTrash, BsDash, BsPlus, BsCheckCircleFill,
  BsBag, BsArrowLeft, BsTruck, BsShield, BsTelephone,
} from "react-icons/bs";
import { useCart } from "../context/CartContext";
import styles from "./page.module.css";

interface FormData {
  name: string;
  phone: string;
  address: string;
  city: string;
  notes: string;
}

export default function CheckoutPage() {
  const { items, removeFromCart, updateQty, totalPrice, clearCart } = useCart();

  const [form, setForm] = useState<FormData>({
    name: "", phone: "", address: "", city: "", notes: "",
  });
  const [errors, setErrors] = useState<Partial<FormData>>({});
  const [submitted, setSubmitted] = useState(false);
  const [orderNum] = useState(() => Math.floor(10000 + Math.random() * 90000));

  const SHIPPING = totalPrice >= 500 ? 0 : 50;
  const TOTAL = totalPrice + SHIPPING;

  function validate() {
    const e: Partial<FormData> = {};
    if (!form.name.trim())    e.name    = "Câmpul este obligatoriu";
    if (!form.phone.trim())   e.phone   = "Câmpul este obligatoriu";
    if (!form.address.trim()) e.address = "Câmpul este obligatoriu";
    if (!form.city.trim())    e.city    = "Câmpul este obligatoriu";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    clearCart();
    setSubmitted(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
            Comanda <strong>#{orderNum}</strong> a fost înregistrată cu succes.
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
            <h1>Finalizează comanda</h1>
            <span className={styles.headerCount}>{items.reduce((s, i) => s + i.qty, 0)} produse</span>
          </div>
        </div>
      </div>

      {/* ── Main layout ── */}
      <div className={styles.layout}>

        {/* LEFT — cart items */}
        <div className={styles.cartCol}>
          <div className={styles.colHeader}>
            <h2>Coșul tău</h2>
          </div>

          <AnimatePresence>
            {items.map((item) => (
              <motion.div
                key={item.product.id}
                className={styles.cartItem}
                layout
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.28 }}
              >
                <Link href={`/produse/${item.product.id}`} className={styles.itemImgLink}>
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
                  <Link href={`/produse/${item.product.id}`} className={styles.itemName}>
                    {item.product.name}
                  </Link>
                  <span className={styles.itemUnitPrice}>{item.product.price} MDL / buc.</span>
                </div>
                <div className={styles.itemQty}>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQty(item.product.id, item.qty - 1)}
                  >
                    <BsDash size={14} />
                  </button>
                  <span className={styles.qtyVal}>{item.qty}</span>
                  <button
                    className={styles.qtyBtn}
                    onClick={() => updateQty(item.product.id, item.qty + 1)}
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
                    onClick={() => removeFromCart(item.product.id)}
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
            <h2>Sumar comandă</h2>
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
              <span className={styles.trustItem}><BsShield size={13} /> Plată la livrare</span>
              <span className={styles.trustItem}><BsTruck size={13} /> Livrare rapidă</span>
            </div>
          </div>

          {/* Delivery form */}
          <form className={styles.form} onSubmit={handleSubmit} noValidate>
            <h2>Date livrare</h2>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Nume și Prenume *</label>
              <input
                className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                placeholder="Ion Popescu"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              {errors.name && <span className={styles.error}>{errors.name}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Număr de telefon *</label>
              <input
                className={`${styles.input} ${errors.phone ? styles.inputError : ""}`}
                placeholder="+373 60 000 000"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
              {errors.phone && <span className={styles.error}>{errors.phone}</span>}
            </div>

            <div className={styles.fieldRow}>
              <div className={styles.fieldGroup}>
                <label className={styles.label}>Oraș *</label>
                <input
                  className={`${styles.input} ${errors.city ? styles.inputError : ""}`}
                  placeholder="Chișinău"
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                />
                {errors.city && <span className={styles.error}>{errors.city}</span>}
              </div>
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Adresă de livrare *</label>
              <input
                className={`${styles.input} ${errors.address ? styles.inputError : ""}`}
                placeholder="Str. Ștefan cel Mare, nr. 1, ap. 5"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
              {errors.address && <span className={styles.error}>{errors.address}</span>}
            </div>

            <div className={styles.fieldGroup}>
              <label className={styles.label}>Mențiuni (opțional)</label>
              <textarea
                className={styles.textarea}
                placeholder="Instrucțiuni speciale, etaj, interfon..."
                rows={3}
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </div>

            <button type="submit" className={styles.submitBtn}>
              <BsCheckCircleFill size={17} />
              Plasează comanda — {TOTAL} MDL
            </button>
          </form>

        </div>
      </div>
    </div>
  );
}
