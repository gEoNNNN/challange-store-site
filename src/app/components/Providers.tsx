"use client";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { LanguageProvider } from "../context/LanguageContext";
import CartDrawer from "./CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <CartProvider>
        <FavoritesProvider>
          {children}
          <CartDrawer />
        </FavoritesProvider>
      </CartProvider>
    </LanguageProvider>
  );
}
