import ro from "./ro.json";
import ru from "./ru.json";
import en from "./en.json";

export type Locale = "ro" | "ru" | "en";

export type Translations = typeof ro;

const translations: Record<Locale, Translations> = { ro, ru, en };

/**
 * Returns the translations for a given locale.
 * Any key that is an empty string falls back to the Romanian value
 * so the site never shows blank text while translations are in progress.
 */
export function getTranslations(locale: Locale): Translations {
  if (locale === "ro") return ro;

  const target = translations[locale] as Record<string, unknown>;
  const base   = ro                   as Record<string, unknown>;

  const merged: Record<string, unknown> = {};

  for (const section in base) {
    const baseSection   = base[section]   as Record<string, string>;
    const targetSection = (target[section] ?? {}) as Record<string, string>;

    merged[section] = Object.fromEntries(
      Object.entries(baseSection).map(([key, roValue]) => {
        const translated = targetSection[key];
        return [key, translated && translated.trim() !== "" ? translated : roValue];
      })
    );
  }

  return merged as Translations;
}

export { ro, ru, en };
