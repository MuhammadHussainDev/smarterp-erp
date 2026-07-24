"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function StockPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ productId: "", warehouseId: "", quantity: "", batchNumber: "", serialNumber: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["stock"],
    queryFn: () => api.get<any>("/warehouse/stock?limit=50"),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get<any>("/warehouse/stores"),
    enabled: showForm || editingId !== null,
  });

  const { data: products } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get<any>("/inventory/products"),
    enabled: showForm || editingId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/warehouse/stock", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["stock"] }); setShowForm(false); setForm({ productId: "", warehouseId: "", quantity: "", batchNumber: "", serialNumber: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/warehouse/stock/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["stock"] }); setEditingId(null); setForm({ productId: "", warehouseId: "", quantity: "", batchNumber: "", serialNumber: "" }); },
    onError: (err: Error) => { alert("Update failed: " + err.message); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/warehouse/stock/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stock"] }),
    onError: (err: Error) => { alert("Delete failed: " + err.message); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  const resetForm = () => setForm({ productId: "", warehouseId: "", quantity: "", batchNumber: "", serialNumber: "" });

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
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm || editingId ? "Cancel" : "Add Stock"}
        </button>
      </div>

      {(showForm || editingId) && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const payload = { product: form.productId, warehouse: form.warehouseId, quantity: Number(form.quantity) || 0, batch_number: form.batchNumber || undefined, serial_number: form.serialNumber || undefined };
          if (editingId) updateMutation.mutate({ id: editingId, data: payload });
          else createMutation.mutate(payload);
        }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-5">
            <select value={form.productId} onChange={(e) => setForm({ ...form, productId: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select product</option>
              {products?.data?.map((p: any) => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
            <select value={form.warehouseId} onChange={(e) => setForm({ ...form, warehouseId: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">Select warehouse</option>
              {warehouses?.data?.map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <input placeholder="Quantity" type="number" value={form.quantity} onChange={(e) => setForm({ ...form, quantity: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Batch number" value={form.batchNumber} onChange={(e) => setForm({ ...form, batchNumber: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Serial number" value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {editingId ? "Save" : "Create Stock"}
          </button>
        </form>
      )}

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
                <th className="p-4">Actions</th>
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
                    <td className="p-4">
                      <button onClick={() => { setEditingId(s.id); setShowForm(false); setForm({ productId: s.product, warehouseId: s.warehouse, quantity: String(s.quantity), batchNumber: s.batch_number || "", serialNumber: s.serial_number || "" }); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                      <button onClick={() => { if (confirm("Delete this stock record?")) deleteMutation.mutate(s.id); }} className="text-sm text-destructive hover:underline">Delete</button>
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
