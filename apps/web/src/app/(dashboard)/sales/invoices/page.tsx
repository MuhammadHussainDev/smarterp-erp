"use client";



export const dynamic = "force-dynamic";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-700", CANCELLED: "bg-yellow-100 text-yellow-700",
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => api.get<any>("/sales/invoices"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sales/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Invoices</h1>
        <p className="text-sm text-muted-foreground">Manage invoices and payments</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Number</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Due Date</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((inv: any) => (
              <tr key={inv.id}>
                <td className="p-4 font-medium">{inv.number}</td>
                <td className="p-4">{inv.customer?.name}</td>
                <td className="p-4 text-muted-foreground">{new Date(inv.issueDate).toLocaleDateString()}</td>
                <td className="p-4 text-muted-foreground">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "-"}</td>
                <td className="p-4">${Number(inv.grandTotal ?? 0).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[inv.status] || ""}`}>{inv.status}</span>
                </td>
                <td className="p-4">
                  <button onClick={() => { if (confirm("Delete this invoice?")) deleteMutation.mutate(inv.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

