"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", SENT: "bg-blue-100 text-blue-700",
  CONFIRMED: "bg-green-100 text-green-700", SHIPPED: "bg-cyan-100 text-cyan-700",
  RECEIVED: "bg-purple-100 text-purple-700", CANCELLED: "bg-red-100 text-red-700",
};

export default function PurchaseOrdersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplierId: "", status: "DRAFT", notes: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["purchase-orders"],
    queryFn: () => api.get<any>("/purchasing/orders"),
  });

  const { data: suppliersData } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<any>("/purchasing/suppliers"),
    enabled: showForm,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/purchasing/orders", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }); setShowForm(false); setForm({ supplierId: "", status: "DRAFT", notes: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/purchasing/orders/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-orders"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Purchase Orders</h1>
          <p className="text-sm text-muted-foreground">Manage orders to suppliers</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Order"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate({ supplier: form.supplierId, status: form.status, notes: form.notes || undefined }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <select value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select supplier</option>
              {suppliersData?.data?.map((s: any) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
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
          <p className="text-lg font-medium">No purchase orders yet</p>
          <p className="mt-1 text-sm">Create your first purchase order to start tracking purchases.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium">
                <th className="p-4">Number</th>
                <th className="p-4">Supplier</th>
                <th className="p-4">Issue Date</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {data?.data?.map((po: any) => (
                <tr key={po.id}>
                  <td className="p-4 font-medium">{po.number}</td>
                  <td className="p-4">{po.supplier_name || po.supplier?.name || "-"}</td>
                  <td className="p-4 text-muted-foreground">{po.order_date ? new Date(po.order_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4">${Number(po.grand_total ?? 0).toFixed(2)}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[po.status] || ""}`}>{po.status}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { if (confirm("Delete this purchase order?")) deleteMutation.mutate(po.id); }} className="text-sm text-destructive hover:underline">Delete</button>
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
