import { create } from "zustand";
import { persist } from "zustand/middleware";

type Locale = "en" | "es" | "fr" | "de";

interface LocaleStore {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

export const useLocaleStore = create<LocaleStore>()(
  persist(
    (set) => ({
      locale: "en",
      setLocale: (locale) => set({ locale }),
    }),
    { name: "locale-store" }
  )
);
