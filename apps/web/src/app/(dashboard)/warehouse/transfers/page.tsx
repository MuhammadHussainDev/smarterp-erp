"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function StockTransfersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["stock-transfers"],
    queryFn: () => api.get<any>("/warehouse/transfers"),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Stock Transfers</h1>
        <p className="text-sm text-muted-foreground">Transfer stock between warehouses</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Number</th>
              <th className="p-4">From</th>
              <th className="p-4">To</th>
              <th className="p-4">Date</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((t: any) => (
              <tr key={t.id}>
                <td className="p-4 font-medium">{t.number}</td>
                <td className="p-4">{t.fromWarehouse?.name}</td>
                <td className="p-4">{t.toWarehouse?.name}</td>
                <td className="p-4 text-muted-foreground">{new Date(t.transferDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[t.status] || ""}`}>{t.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

