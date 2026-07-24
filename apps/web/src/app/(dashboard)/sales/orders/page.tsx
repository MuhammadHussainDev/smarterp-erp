"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700", CONFIRMED: "bg-blue-100 text-blue-700",
  PROCESSING: "bg-purple-100 text-purple-700", SHIPPED: "bg-cyan-100 text-cyan-700",
  DELIVERED: "bg-green-100 text-green-700", CANCELLED: "bg-red-100 text-red-700",
};

export default function OrdersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: "", status: "PENDING", notes: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["sales-orders"],
    queryFn: () => api.get<any>("/sales/orders"),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<any>("/crm/customers"),
    enabled: showForm,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/sales/orders", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sales-orders"] }); setShowForm(false); setForm({ customerId: "", status: "PENDING", notes: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sales/orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["sales-orders"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Orders</h1>
          <p className="text-sm text-muted-foreground">View and manage sales orders</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Order"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ customer: form.customerId, status: form.status, notes: form.notes || undefined }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <select value={form.customerId} onChange={(e) => setForm({ ...form, customerId: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select customer</option>
              {customersData?.data?.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="PENDING">Pending</option>
              <option value="CONFIRMED">Confirmed</option>
            </select>
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {createMutation.isPending ? "Creating..." : "Create Order"}
          </button>
        </form>
      )}

      {data?.data?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No sales orders yet</p>
          <p className="mt-1 text-sm">Create your first sales order to start tracking.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium">
                <th className="p-4">Number</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {data?.data?.map((o: any) => (
                <tr key={o.id}>
                  <td className="p-4 font-medium">{o.number}</td>
                  <td className="p-4">{o.customer_name || o.customer?.name || "-"}</td>
                  <td className="p-4 text-muted-foreground">{o.order_date ? new Date(o.order_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4">${Number(o.grand_total ?? 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[o.status] || ""}`}>{o.status}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { if (confirm("Delete this sales order?")) deleteMutation.mutate(o.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
