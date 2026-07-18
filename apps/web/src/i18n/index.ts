import en from "./en.json";
import es from "./es.json";
import fr from "./fr.json";
import de from "./de.json";

export const translations = { en, es, fr, de };
export type Locale = keyof typeof translations;

export function t(key: string, locale: Locale = "en"): string {
  const keys = key.split(".");
  let value: any = translations[locale];
  for (const k of keys) {
    if (value == null) return key;
    value = value[k];
  }
  return (value as string) ?? key;
}
