"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", SENT: "bg-blue-100 text-blue-700",
  PAID: "bg-green-100 text-green-700", OVERDUE: "bg-red-100 text-red-700", CANCELLED: "bg-yellow-100 text-yellow-700",
};

export default function InvoicesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ customerId: "", status: "DRAFT", notes: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["invoices"],
    queryFn: () => api.get<any>("/sales/invoices"),
  });

  const { data: customersData } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<any>("/crm/customers"),
    enabled: showForm,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/sales/invoices", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["invoices"] }); setShowForm(false); setForm({ customerId: "", status: "DRAFT", notes: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/sales/invoices/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["invoices"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Invoices</h1>
          <p className="text-sm text-muted-foreground">Manage invoices and payments</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Invoice"}
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
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
            </select>
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {createMutation.isPending ? "Creating..." : "Create Invoice"}
          </button>
        </form>
      )}

      {data?.data?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No invoices yet</p>
          <p className="mt-1 text-sm">Create your first invoice to start tracking payments.</p>
        </div>
      ) : (
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
                  <td className="p-4">{inv.customer_name || inv.customer?.name || "-"}</td>
                  <td className="p-4 text-muted-foreground">{inv.invoice_date ? new Date(inv.invoice_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4 text-muted-foreground">{inv.due_date ? new Date(inv.due_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4">${Number(inv.grand_total ?? 0).toFixed(2)}</td>
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
      )}
    </div>
  );
}
