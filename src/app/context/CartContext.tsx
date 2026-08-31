"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Product } from "../produse/productsData";

export interface CartItem {
  product: Product;
  qty: number;
}

type ProductKey = number | string;

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, qty?: number) => void;
  removeFromCart: (id: ProductKey) => void;
  updateQty: (id: ProductKey, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const getProductKey = (product: Product): ProductKey => product.uid ?? product.id;

const getStockLimit = (product: Product) => {
  if (!product.inStock) return 0;
  return typeof product.remain === "number" && Number.isFinite(product.remain)
    ? Math.max(0, Math.floor(product.remain))
    : Number.MAX_SAFE_INTEGER;
};

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => {
      try {
        const saved = localStorage.getItem("cs_cart");
        if (saved) {
          const parsed = JSON.parse(saved) as CartItem[];
          setItems(parsed
            .map((item) => ({ ...item, qty: Math.min(item.qty, getStockLimit(item.product)) }))
            .filter((item) => item.qty > 0));
        }
      } catch {}
      setIsHydrated(true);
    }, 0);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    if (isHydrated) localStorage.setItem("cs_cart", JSON.stringify(items));
  }, [isHydrated, items]);

  const addToCart = (product: Product, qty = 1) => {
    const stockLimit = getStockLimit(product);
    const amount = Math.max(0, Math.floor(qty));
    if (stockLimit === 0 || amount === 0) return;

    setItems((prev) => {
      const productKey = getProductKey(product);
      const existing = prev.find((i) => getProductKey(i.product) === productKey);
      if (existing)
        return prev.map((i) =>
          getProductKey(i.product) === productKey
            ? { product, qty: Math.min(i.qty + amount, stockLimit) }
            : i
        );
      return [...prev, { product, qty: Math.min(amount, stockLimit) }];
    });
  };

  const removeFromCart = (id: ProductKey) =>
    setItems((prev) => prev.filter((i) => getProductKey(i.product) !== id));

  const updateQty = (id: ProductKey, qty: number) => {
    if (qty <= 0) return removeFromCart(id);
    setItems((prev) =>
      prev.map((i) => getProductKey(i.product) === id
        ? { ...i, qty: Math.min(Math.floor(qty), getStockLimit(i.product)) }
        : i)
        .filter((i) => i.qty > 0)
    );
  };

  const clearCart = () => setItems([]);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const totalPrice = items.reduce((s, i) => s + i.product.price * i.qty, 0);

  return (
    <CartContext.Provider
      value={{
        items, addToCart, removeFromCart, updateQty, clearCart,
        totalItems, totalPrice,
        isDrawerOpen, openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
