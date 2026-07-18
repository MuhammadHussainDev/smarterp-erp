"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useLocaleStore } from "@/stores/locale-store";
import { useSettingsStore } from "@/stores/settings-store";
import { useToast } from "@/hooks/use-toast";

const locales = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
] as const;

const timezones = [
  "UTC",
  "US/Eastern",
  "US/Pacific",
  "Europe/London",
  "Europe/Berlin",
  "Asia/Tokyo",
  "Asia/Shanghai",
] as const;

const dateFormats = ["MM/DD/YYYY", "DD/MM/YYYY", "YYYY-MM-DD"] as const;

const timeFormats = ["12h", "24h"] as const;

const currencies = ["USD", "EUR", "GBP", "JPY", "CNY"] as const;

export default function LocalizationSettingsPage() {
  const { toast } = useToast();
  const localeStore = useLocaleStore();
  const settingsStore = useSettingsStore();

  const [locale, setLocale] = useState(localeStore.locale);
  const [timezone, setTimezone] = useState(settingsStore.timezone);
  const [dateFormat, setDateFormat] = useState(settingsStore.dateFormat);
  const [timeFormat, setTimeFormat] = useState(settingsStore.timeFormat);
  const [currency, setCurrency] = useState(settingsStore.currency);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    localeStore.setLocale(locale as any);
    settingsStore.setTimezone(timezone as any);
    settingsStore.setDateFormat(dateFormat as any);
    settingsStore.setTimeFormat(timeFormat as any);
    settingsStore.setCurrency(currency as any);
    toast({ title: "Settings saved successfully" });
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Localization Settings</h1>
        <p className="text-sm text-muted-foreground">
          Manage language, timezone, date and currency preferences
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Language</label>
            <select
              value={locale}
              onChange={(e) => setLocale(e.target.value as "en" | "es" | "fr" | "de")}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {locales.map((l) => (
                <option key={l.value} value={l.value}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Timezone</label>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value as any)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {timezones.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => setDateFormat(e.target.value as any)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {dateFormats.map((df) => (
                <option key={df} value={df}>
                  {df}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Time Format</label>
            <select
              value={timeFormat}
              onChange={(e) => setTimeFormat(e.target.value as any)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {timeFormats.map((tf) => (
                <option key={tf} value={tf}>
                  {tf === "12h" ? "12-hour" : "24-hour"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Currency</label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value as any)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            >
              {currencies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Save Settings
        </button>
      </form>
    </div>
  );
}

