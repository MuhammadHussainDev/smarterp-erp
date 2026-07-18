"use client";
import { useLocaleStore } from "@/stores/locale-store";
import { t, type Locale } from "@/i18n";

export function useTranslation() {
  const locale = useLocaleStore((s) => s.locale);
  return {
    t: (key: string) => t(key, locale as Locale),
    locale,
  };
}
