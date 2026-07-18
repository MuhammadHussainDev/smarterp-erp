"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function InsightsWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ["ai-predictions"],
    queryFn: () => api.get<any>("/ai/predictions"),
  });

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  const salesForecast = data?.salesForecast ?? data?.forecast;
  const lowStock = data?.lowStock ?? data?.lowStockAlerts;
  const payments = data?.upcomingPayments ?? data?.payments;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs text-muted-foreground">Forecasted Revenue</p>
        <p className="mt-1 text-2xl font-bold">
          ${(salesForecast?.predictedRevenue ?? salesForecast?.amount ?? 0).toLocaleString()}
        </p>
        <p className="text-xs text-muted-foreground">next month projection</p>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">Low Stock Alerts</p>
          <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
            {lowStock?.count ?? lowStock?.length ?? 0}
          </span>
        </div>
        {lowStock?.items && lowStock.items.length > 0 && (
          <ul className="mt-2 space-y-1">
            {lowStock.items.slice(0, 3).map((item: any, i: number) => (
              <li key={i} className="flex justify-between text-xs">
                <span>{item.name ?? item.productName}</span>
                <span className="text-muted-foreground">{item.quantity ?? item.stock} left</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="rounded-lg border bg-card p-4">
        <p className="text-xs text-muted-foreground">Upcoming Payments</p>
        <p className="mt-1 text-2xl font-bold">{(payments?.count ?? payments?.length ?? 0)}</p>
        <p className="text-xs text-muted-foreground">
          Total: ${(payments?.totalAmount ?? payments?.total ?? 0).toLocaleString()}
        </p>
      </div>
    </div>
  );
}
