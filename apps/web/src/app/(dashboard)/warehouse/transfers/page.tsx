"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
};

export default function StockTransfersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ sourceWarehouseId: "", destinationWarehouseId: "", status: "DRAFT", notes: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["stock-transfers"],
    queryFn: () => api.get<any>("/warehouse/transfers"),
  });

  const { data: warehouses } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get<any>("/warehouse/stores"),
    enabled: showForm || editingId !== null,
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/warehouse/transfers", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["stock-transfers"] }); setShowForm(false); setForm({ sourceWarehouseId: "", destinationWarehouseId: "", status: "DRAFT", notes: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/warehouse/transfers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["stock-transfers"] }); setEditingId(null); setForm({ sourceWarehouseId: "", destinationWarehouseId: "", status: "DRAFT", notes: "" }); },
    onError: (err: Error) => { alert("Update failed: " + err.message); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/warehouse/transfers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stock-transfers"] }),
    onError: (err: Error) => { alert("Delete failed: " + err.message); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  const resetForm = () => setForm({ sourceWarehouseId: "", destinationWarehouseId: "", status: "DRAFT", notes: "" });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Stock Transfers</h1>
          <p className="text-sm text-muted-foreground">Transfer stock between warehouses</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); resetForm(); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm || editingId ? "Cancel" : "Add Transfer"}
        </button>
      </div>

      {(showForm || editingId) && (
        <form onSubmit={(e) => {
          e.preventDefault();
          const payload = { source_warehouse: form.sourceWarehouseId, destination_warehouse: form.destinationWarehouseId, status: form.status, notes: form.notes || undefined };
          if (editingId) updateMutation.mutate({ id: editingId, data: payload });
          else createMutation.mutate(payload);
        }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <select value={form.sourceWarehouseId} onChange={(e) => setForm({ ...form, sourceWarehouseId: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">From warehouse</option>
              {warehouses?.data?.filter((w: any) => w.id !== form.destinationWarehouseId).map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select value={form.destinationWarehouseId} onChange={(e) => setForm({ ...form, destinationWarehouseId: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="">To warehouse</option>
              {warehouses?.data?.filter((w: any) => w.id !== form.sourceWarehouseId).map((w: any) => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="DRAFT">Draft</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <input placeholder="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createMutation.isPending || updateMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {editingId ? "Save" : "Create Transfer"}
          </button>
        </form>
      )}

      {data?.data?.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground">
          <p className="text-lg font-medium">No stock transfers yet</p>
          <p className="mt-1 text-sm">Create your first transfer to move stock between warehouses.</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b text-left text-sm font-medium">
                <th className="p-4">Number</th>
                <th className="p-4">From</th>
                <th className="p-4">To</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm">
              {data?.data?.map((t: any) => (
                <tr key={t.id}>
                  <td className="p-4 font-medium">{t.number}</td>
                  <td className="p-4">{t.source_warehouse_name || t.source_warehouse?.name || "-"}</td>
                  <td className="p-4">{t.destination_warehouse_name || t.destination_warehouse?.name || "-"}</td>
                  <td className="p-4 text-muted-foreground">{t.transfer_date ? new Date(t.transfer_date).toLocaleDateString() : "-"}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[t.status] || ""}`}>{t.status}</span>
                  </td>
                  <td className="p-4">
                    <button onClick={() => { setEditingId(t.id); setShowForm(false); setForm({ sourceWarehouseId: t.source_warehouse, destinationWarehouseId: t.destination_warehouse, status: t.status, notes: t.notes || "" }); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                    <button onClick={() => { if (confirm("Delete this stock transfer?")) deleteMutation.mutate(t.id); }} className="text-sm text-destructive hover:underline">Delete</button>
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
