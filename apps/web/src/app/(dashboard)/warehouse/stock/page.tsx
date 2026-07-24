"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function StockPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: () => api.get<any>("/warehouse/stock?limit=50"),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get<any>("/warehouse/stores"),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Levels</h1>
          <p className="text-sm text-muted-foreground">
            Current inventory across all warehouses
            {data?.meta?.lowStock > 0 && (
              <span className="ml-2 rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">
                {data.meta.lowStock} low stock alerts
              </span>
            )}
          </p>
        </div>
      </div>

      {data?.data?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No stock records yet</p>
          <p className="mt-1 text-sm">Stock will appear when products are added to warehouses.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium">
                <th className="p-4">Product</th>
                <th className="p-4">SKU</th>
                <th className="p-4">Barcode</th>
                <th className="p-4">Warehouse</th>
                <th className="p-4">Quantity</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {data?.data?.map((s: any) => {
                const isLow = s.product_min_stock_level > 0 && s.quantity <= s.product_min_stock_level;
                return (
                  <tr key={s.id} className={isLow ? "bg-red-50" : ""}>
                    <td className="p-4 font-medium">{s.product_name}</td>
                    <td className="p-4 text-muted-foreground">{s.product_sku}</td>
                    <td className="p-4 font-mono text-xs">{s.product_barcode || "-"}</td>
                    <td className="p-4">{s.warehouse_name}</td>
                    <td className="p-4">{s.quantity}</td>
                    <td className="p-4">
                      {isLow ? (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">Low Stock</span>
                      ) : (
                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">OK</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
