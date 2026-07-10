"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BsCart3, BsX, BsTrash } from "react-icons/bs";
import { useCart } from "../context/CartContext";
import styles from "./CartDrawer.module.css";

export default function CartDrawer() {
  const { items, isDrawerOpen, closeDrawer, removeFromCart, updateQty, clearCart, totalItems, totalPrice } = useCart();
  const router = useRouter();

  const handleCheckout = () => {
    closeDrawer();
    router.push("/checkout");
  };

  if (!isDrawerOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeDrawer} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div className={styles.headerTitle}>
            <BsCart3 size={20} />
            Coșul meu
            <span className={styles.headerCount}>
              {totalItems} {totalItems === 1 ? "produs" : "produse"}
            </span>
          </div>
          <button className={styles.closeBtn} onClick={closeDrawer} aria-label="Închide">
            <BsX size={20} />
          </button>
        </div>

        <div className={styles.body}>
          {items.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>🛒</span>
              <span className={styles.emptyText}>Coșul tău este gol</span>
            </div>
          ) : (
            items.map(({ product: p, qty }) => (
              <div key={p.id} className={styles.item}>
                <div className={styles.itemImg}>
                  <Image
                    src={p.img}
                    alt={p.name}
                    fill
                    sizes="70px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemBrand}>{p.brand}</div>
                  <div className={styles.itemName}>{p.name}</div>
                  <div className={styles.itemPrice}>{p.price * qty} MDL</div>
                </div>
                <div className={styles.itemActions}>
                  <div className={styles.qtyRow}>
                    <button className={styles.qtyBtn} onClick={() => updateQty(p.id, qty - 1)}>−</button>
                    <span className={styles.qtyNum}>{qty}</span>
                    <button className={styles.qtyBtn} onClick={() => updateQty(p.id, qty + 1)}>+</button>
                  </div>
                  <button className={styles.removeBtn} onClick={() => removeFromCart(p.id)}>
                    <BsTrash size={13} /> Șterge
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Subtotal</span>
              <span className={styles.totalSub}>{totalPrice} MDL</span>
            </div>
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Livrare</span>
              <span className={totalPrice >= 500 ? styles.freeShipping : styles.totalSub}>
                {totalPrice >= 500 ? "Gratuit 🎉" : "+50 MDL"}
              </span>
            </div>
            {totalPrice < 500 && (
              <p className={styles.shippingNote}>Livrare în aria Chișinăului · Gratuit la comenzi ≥ 500 MDL</p>
            )}
            <div className={styles.footerDivider} />
            <div className={styles.totalRow}>
              <span className={styles.totalLabel}>Total</span>
              <span className={styles.totalPrice}>{totalPrice >= 500 ? totalPrice : totalPrice + 50} MDL</span>
            </div>
            <button className={styles.checkoutBtn} onClick={handleCheckout}>Finalizează comanda</button>
            <button className={styles.clearBtn} onClick={clearCart}>
              <BsTrash size={12} /> Golește coșul
            </button>
          </div>
        )}
      </div>
    </>
  );
}
