import { create } from "zustand";
import { persist } from "zustand/middleware";

type Timezone =
  | "UTC"
  | "US/Eastern"
  | "US/Pacific"
  | "Europe/London"
  | "Europe/Berlin"
  | "Asia/Tokyo"
  | "Asia/Shanghai";

type DateFormat = "MM/DD/YYYY" | "DD/MM/YYYY" | "YYYY-MM-DD";

type TimeFormat = "12h" | "24h";

type Currency = "USD" | "EUR" | "GBP" | "JPY" | "CNY";

interface SettingsStore {
  timezone: Timezone;
  dateFormat: DateFormat;
  timeFormat: TimeFormat;
  currency: Currency;
  setTimezone: (timezone: Timezone) => void;
  setDateFormat: (dateFormat: DateFormat) => void;
  setTimeFormat: (timeFormat: TimeFormat) => void;
  setCurrency: (currency: Currency) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      timezone: "UTC",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      currency: "USD",
      setTimezone: (timezone) => set({ timezone }),
      setDateFormat: (dateFormat) => set({ dateFormat }),
      setTimeFormat: (timeFormat) => set({ timeFormat }),
      setCurrency: (currency) => set({ currency }),
    }),
    { name: "settings-store" }
  )
);
