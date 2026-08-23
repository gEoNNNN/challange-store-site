"use client";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { LanguageProvider } from "../context/LanguageContext";
import { FontThemeProvider } from "../context/FontThemeContext";
import CartDrawer from "./CartDrawer";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FontThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <FavoritesProvider>
            {children}
            <CartDrawer />
          </FavoritesProvider>
        </CartProvider>
      </LanguageProvider>
    </FontThemeProvider>
  );
}
