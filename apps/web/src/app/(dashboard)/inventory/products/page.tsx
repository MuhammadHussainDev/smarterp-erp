"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", sku: "", barcode: "", sellingPrice: 0, costPrice: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<any>("/inventory/products"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/products", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); setShowForm(false); setForm({ name: "", sku: "", barcode: "", sellingPrice: 0, costPrice: 0 }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/inventory/products/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["products"] }); setEditingId(null); setForm({ name: "", sku: "", barcode: "", sellingPrice: 0, costPrice: 0 }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/products/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["products"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Products</h1>
          <p className="text-sm text-muted-foreground">Manage product catalog with barcode support</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", sku: "", barcode: "", sellingPrice: 0, costPrice: 0 }); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Product"}
        </button>
      </div>

      {showForm && !editingId && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder="Selling price" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Cost price" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create Product"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, data: form }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder="Product name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Barcode" value={form.barcode} onChange={(e) => setForm({ ...form, barcode: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder="Selling price" type="number" step="0.01" value={form.sellingPrice} onChange={(e) => setForm({ ...form, sellingPrice: +e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Cost price" type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: +e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={updateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", sku: "", barcode: "", sellingPrice: 0, costPrice: 0 }); }}
              className="rounded-md border px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">SKU</th>
              <th className="p-4">Barcode</th>
              <th className="p-4">Category</th>
              <th className="p-4">Brand</th>
              <th className="p-4">Selling Price</th>
              <th className="p-4">Active</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((p: any) => (
              <tr key={p.id}>
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4 text-muted-foreground">{p.sku}</td>
                <td className="p-4 font-mono text-xs">{p.barcode || "-"}</td>
                <td className="p-4">{p.category?.name || "-"}</td>
                <td className="p-4">{p.brand?.name || "-"}</td>
                <td className="p-4">${Number(p.sellingPrice ?? 0).toFixed(2)}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {p.isActive ? "Yes" : "No"}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => { setEditingId(p.id); setForm({ name: p.name, sku: p.sku, barcode: p.barcode || "", sellingPrice: p.sellingPrice || 0, costPrice: p.costPrice || 0 }); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                  <button onClick={() => { if (confirm("Delete this product?")) deleteMutation.mutate(p.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
