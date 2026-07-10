"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Locale, Translations, getTranslations } from "../i18n";

interface LanguageContextValue {
  locale: Locale;
  setLocale: (l: Locale) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextValue>({
  locale: "ro",
  setLocale: () => {},
  t: getTranslations("ro"),
});

const STORAGE_KEY = "cs_locale";

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("ro");

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (saved && ["ro", "ru", "en"].includes(saved)) {
      setLocaleState(saved);
    }
  }, []);

  function setLocale(l: Locale) {
    setLocaleState(l);
    localStorage.setItem(STORAGE_KEY, l);
  }

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t: getTranslations(locale) }}>
      {children}
    </LanguageContext.Provider>
  );
}

/** Returns the current translations and the locale switcher. */
export function useLanguage() {
  return useContext(LanguageContext);
}

/**
 * Shorthand hook — returns only the translations object.
 * Usage:  const t = useTranslations();
 *         <h1>{t.hero.titleLine1}</h1>
 */
export function useTranslations() {
  return useContext(LanguageContext).t;
}
