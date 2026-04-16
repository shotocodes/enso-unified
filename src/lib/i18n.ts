import type { Locale } from "@/types";
import { commonTranslations } from "./i18n-data/common";
import { timerTranslations } from "./i18n-data/timer";
import { taskTranslations } from "./i18n-data/task";
import { focusTranslations } from "./i18n-data/focus";
import { journalTranslations } from "./i18n-data/journal";
import { settingsTranslations } from "./i18n-data/settings";
import { authTranslations } from "./i18n-data/auth";

export type { Locale };

export const LOCALES: { code: Locale; label: string }[] = [
  { code: "ja", label: "日本語" },
  { code: "en", label: "English" },
  { code: "zh", label: "中文" },
  { code: "ko", label: "한국어" },
];

// Merge all translation sources. Later sources override earlier ones in case of key collision.
const translations: Record<string, Record<Locale, string>> = {
  ...commonTranslations,
  ...timerTranslations,
  ...taskTranslations,
  ...focusTranslations,
  ...journalTranslations,
  ...settingsTranslations,
  ...authTranslations,
};

// Module-level locale cache for hooks/non-React calls that don't have locale prop
let _locale: Locale = "ja";

export function setLocale(locale: Locale): void {
  _locale = locale;
}

/**
 * Translate a key. Unknown keys fall back to English, then to the key itself.
 */
export function t(key: string, locale?: Locale): string {
  const entry = translations[key];
  if (!entry) return key;
  const l = locale ?? _locale;
  return entry[l] || entry["en"] || key;
}

/**
 * Translate and interpolate {0}, {1}, ... placeholders.
 */
export function tFormat(key: string, locale: Locale | undefined, ...args: (string | number)[]): string {
  let result = t(key, locale);
  args.forEach((arg, i) => {
    result = result.replace(new RegExp(`\\{${i}\\}`, "g"), String(arg));
  });
  return result;
}
