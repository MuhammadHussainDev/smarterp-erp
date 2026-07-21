"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", SENT: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700", SHIPPED: "bg-cyan-100 text-cyan-700",
  RECEIVED: "bg-purple-100 text-purple-700", CANCELLED: "bg-red-100 text-red-700",
};

export default function PurchaseOrdersPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => api.get<any>("/purchasing/orders"),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Orders</h1>
        <p className="text-sm text-muted-foreground">Manage orders to suppliers</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Number</th>
              <th className="p-4">Supplier</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((po: any) => (
              <tr key={po.id}>
                <td className="p-4 font-medium">{po.number}</td>
                <td className="p-4">{po.supplier?.name}</td>
                <td className="p-4 text-muted-foreground">{new Date(po.issueDate).toLocaleDateString()}</td>
                <td className="p-4">${Number(po.grandTotal ?? 0).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[po.status] || ""}`}>{po.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

