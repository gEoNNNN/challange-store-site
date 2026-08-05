"use client";
import { CartProvider } from "../context/CartContext";
import { FavoritesProvider } from "../context/FavoritesContext";
import { LanguageProvider } from "../context/LanguageContext";
import { FontThemeProvider } from "../context/FontThemeContext";
import CartDrawer from "./CartDrawer";
import FontSwitcher from "./FontSwitcher";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <FontThemeProvider>
      <LanguageProvider>
        <CartProvider>
          <FavoritesProvider>
            {children}
            <CartDrawer />
            <FontSwitcher />
          </FavoritesProvider>
        </CartProvider>
      </LanguageProvider>
    </FontThemeProvider>
  );
}
