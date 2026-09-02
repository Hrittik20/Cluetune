import { SITE } from "../consts";

export const DEFAULT_LOCALE = "en" as const;

export type LocaleCode = "en" | "es" | "ja" | "fr" | "de" | "pt" | "ko" | "it" | "ru";

export interface LocaleConfig {
  code: LocaleCode;
  label: string;
  /** Primary BCP-47 hreflang value. */
  hreflang: string;
  /** Open Graph locale (language_TERRITORY). */
  ogLocale: string;
  /** URL path prefix. Empty string for the default locale. */
  pathPrefix: string;
  /** Additional regional hreflang tags that point to this locale page. */
  regionalHreflangs: string[];
}

export const LOCALES: Record<LocaleCode, LocaleConfig> = {
  en: {
    code: "en",
    label: "English",
    hreflang: "en",
    ogLocale: "en_US",
    pathPrefix: "",
    regionalHreflangs: ["en-US", "en-GB", "en-AU", "en-CA"],
  },
  es: {
    code: "es",
    label: "Español",
    hreflang: "es",
    ogLocale: "es_ES",
    pathPrefix: "/es",
    regionalHreflangs: ["es-ES", "es-MX", "es-AR", "es-CO", "es-CL", "es-PE", "es-VE"],
  },
  ja: {
    code: "ja",
    label: "日本語",
    hreflang: "ja",
    ogLocale: "ja_JP",
    pathPrefix: "/ja",
    regionalHreflangs: ["ja-JP"],
  },
  fr: {
    code: "fr",
    label: "Français",
    hreflang: "fr",
    ogLocale: "fr_FR",
    pathPrefix: "/fr",
    regionalHreflangs: ["fr-FR", "fr-CA", "fr-BE", "fr-CH"],
  },
  de: {
    code: "de",
    label: "Deutsch",
    hreflang: "de",
    ogLocale: "de_DE",
    pathPrefix: "/de",
    regionalHreflangs: ["de-DE", "de-AT", "de-CH"],
  },
  pt: {
    code: "pt",
    label: "Português",
    hreflang: "pt",
    ogLocale: "pt_BR",
    pathPrefix: "/pt",
    regionalHreflangs: ["pt-BR", "pt-PT"],
  },
  ko: {
    code: "ko",
    label: "한국어",
    hreflang: "ko",
    ogLocale: "ko_KR",
    pathPrefix: "/ko",
    regionalHreflangs: ["ko-KR"],
  },
  it: {
    code: "it",
    label: "Italiano",
    hreflang: "it",
    ogLocale: "it_IT",
    pathPrefix: "/it",
    regionalHreflangs: ["it-IT", "it-CH"],
  },
  ru: {
    code: "ru",
    label: "Русский",
    hreflang: "ru",
    ogLocale: "ru_RU",
    pathPrefix: "/ru",
    regionalHreflangs: ["ru-RU", "ru-BY", "ru-KZ"],
  },
};

export const LOCALE_CODES = Object.keys(LOCALES) as LocaleCode[];

export function isValidLocale(value: string | undefined): value is LocaleCode {
  return value !== undefined && value in LOCALES;
}

export function localePath(code: LocaleCode): string {
  const prefix = LOCALES[code].pathPrefix;
  return prefix || "/";
}

export function localeUrl(code: LocaleCode): string {
  const path = localePath(code);
  return path === "/" ? SITE.url : `${SITE.url}${path}`;
}

export interface HreflangAlternate {
  hreflang: string;
  href: string;
}

/** Build hreflang alternates for the homepage (or any page with the same slug per locale). */
/** Read the locale prefix from a pathname (`/es/unlimited` → `es`). */
export function localeFromPath(pathname: string): LocaleCode {
  const segment = pathname.replace(/\/$/, "").split("/").filter(Boolean)[0];
  if (segment && isValidLocale(segment)) return segment;
  return DEFAULT_LOCALE;
}

/** Strip the locale prefix so nav active states work on localized URLs. */
export function pathWithoutLocale(pathname: string): string {
  const locale = localeFromPath(pathname);
  if (locale === DEFAULT_LOCALE) {
    const normalized = pathname.replace(/\/$/, "");
    return normalized || "/";
  }
  const prefix = LOCALES[locale].pathPrefix;
  const stripped = pathname.slice(prefix.length).replace(/\/$/, "");
  return stripped ? `/${stripped}` : "/";
}

/** Build a locale-aware path. English keeps bare paths (`/unlimited`). */
export function localizedPath(locale: LocaleCode, path: string): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return normalized;
  if (normalized === "/") return localePath(locale);
  return `${LOCALES[locale].pathPrefix}${normalized}`;
}

export function getHomeHreflangs(): HreflangAlternate[] {
  const alternates: HreflangAlternate[] = [];

  for (const locale of Object.values(LOCALES)) {
    const href = localeUrl(locale.code);
    alternates.push({ hreflang: locale.hreflang, href });
    for (const regional of locale.regionalHreflangs) {
      alternates.push({ hreflang: regional, href });
    }
  }

  alternates.push({ hreflang: "x-default", href: localeUrl(DEFAULT_LOCALE) });
  return alternates;
}

/** hreflang alternates for a game mode page (e.g. `/unlimited`, `/es/unlimited`). */
export function getModeHreflangs(modePath: string): HreflangAlternate[] {
  const alternates: HreflangAlternate[] = [];
  const normalized = modePath.startsWith("/") ? modePath : `/${modePath}`;

  for (const locale of Object.values(LOCALES)) {
    const href = `${SITE.url}${localizedPath(locale.code, normalized)}`;
    alternates.push({ hreflang: locale.hreflang, href });
    for (const regional of locale.regionalHreflangs) {
      alternates.push({ hreflang: regional, href });
    }
  }

  alternates.push({
    hreflang: "x-default",
    href: `${SITE.url}${localizedPath(DEFAULT_LOCALE, normalized)}`,
  });
  return alternates;
}
