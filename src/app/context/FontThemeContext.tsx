"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type FontThemeId =
  | "poppins"
  | "alfa-chivo"
  | "dm-nunito"
  | "alegreya"
  | "geometric"
  | "editorial";

export interface FontThemeOption {
  id: FontThemeId;
  label: string;
  headingName: string;
  bodyName: string;
  headingVar: string;
  bodyVar: string;
}

export const FONT_THEMES: FontThemeOption[] = [
  {
    id: "poppins",
    label: "Modern",
    headingName: "Poppins",
    bodyName: "Poppins",
    headingVar: "var(--font-poppins), sans-serif",
    bodyVar: "var(--font-poppins), sans-serif",
  },
  {
    id: "alfa-chivo",
    label: "Slab Bold",
    headingName: "Alfa Slab One",
    bodyName: "Chivo",
    headingVar: "var(--font-alfa-slab-one), serif",
    bodyVar: "var(--font-chivo), sans-serif",
  },
  {
    id: "dm-nunito",
    label: "Elegant",
    headingName: "DM Serif Display",
    bodyName: "Nunito",
    headingVar: "var(--font-dm-serif-display), serif",
    bodyVar: "var(--font-nunito), sans-serif",
  },
  {
    id: "alegreya",
    label: "Literary",
    headingName: "Alegreya Sans",
    bodyName: "Alegreya",
    headingVar: "var(--font-alegreya-sans), sans-serif",
    bodyVar: "var(--font-alegreya), serif",
  },
  {
    id: "geometric",
    label: "Geometric",
    headingName: "Raleway Heavy",
    bodyName: "Raleway Light",
    headingVar: "var(--font-raleway), sans-serif",
    bodyVar: "var(--font-raleway), sans-serif",
  },
  {
    id: "editorial",
    label: "Editorial",
    headingName: "Fira Sans Black",
    bodyName: "PT Serif",
    headingVar: "var(--font-fira-sans), sans-serif",
    bodyVar: "var(--font-pt-serif), serif",
  },
];

interface FontThemeContextType {
  theme: FontThemeId;
  setTheme: (t: FontThemeId) => void;
}

const FontThemeContext = createContext<FontThemeContextType>({
  theme: "poppins",
  setTheme: () => {},
});

export function FontThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<FontThemeId>("poppins");

  useEffect(() => {
    const saved = localStorage.getItem("cs_font_theme") as FontThemeId | null;
    if (saved && FONT_THEMES.some((f) => f.id === saved)) {
      applyTheme(saved);
      setThemeState(saved);
    } else {
      applyTheme("poppins");
    }
  }, []);

  const setTheme = (t: FontThemeId) => {
    setThemeState(t);
    applyTheme(t);
    localStorage.setItem("cs_font_theme", t);
  };

  return (
    <FontThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </FontThemeContext.Provider>
  );
}

function applyTheme(id: FontThemeId) {
  const el = document.documentElement;
  FONT_THEMES.forEach((f) => el.classList.remove(`font-theme-${f.id}`));
  el.classList.add(`font-theme-${id}`);
}

export const useFontTheme = () => useContext(FontThemeContext);
