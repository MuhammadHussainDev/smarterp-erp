"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700", SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: () => api.get<any>("/sales/orders"),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sales Orders</h1>
        <p className="text-sm text-muted-foreground">View and manage sales orders</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((o: any) => (
              <tr key={o.id}>
                <td className="p-4 font-medium">{o.number}</td>
                <td className="p-4">{o.customer?.name}</td>
                <td className="p-4 text-muted-foreground">{new Date(o.orderDate).toLocaleDateString()}</td>
                <td className="p-4">${Number(o.grandTotal ?? 0).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[o.status] || ""}`}>{o.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

