"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function WarehousesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", isDefault: false });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["warehouses"],
    queryFn: () => api.get<any>("/warehouse/stores"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/warehouse/stores", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["warehouses"] }); setShowForm(false); setForm({ name: "", address: "", isDefault: false }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/warehouse/stores/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["warehouses"] }); setEditingId(null); setForm({ name: "", address: "", isDefault: false }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/warehouse/stores/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["warehouses"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Warehouses</h1>
          <p className="text-sm text-muted-foreground">Manage warehouse locations</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", address: "", isDefault: false }); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Warehouse"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Warehouse name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-input" />
            Default warehouse
          </label>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create Warehouse"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, data: form }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <input placeholder="Warehouse name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })}
              className="rounded border-input" />
            Default warehouse
          </label>
          <div className="flex gap-2">
            <button type="submit" disabled={updateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", address: "", isDefault: false }); }}
              className="rounded-md border border-input px-4 py-2 text-sm">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {data?.data?.map((wh: any) => (
          <div key={wh.id} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{wh.name}</h3>
                <p className="text-sm text-muted-foreground">{wh.address || "No address"}</p>
              </div>
              {wh.isDefault && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">Default</span>
              )}
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{wh._count?.stock || 0} products in stock</p>
            <div className="flex gap-2 mt-4">
              <button onClick={() => { setEditingId(wh.id); setForm({ name: wh.name, address: wh.address || "", isDefault: wh.isDefault }); }} className="text-sm text-primary hover:underline">Edit</button>
              <button onClick={() => { if (confirm("Delete this warehouse?")) deleteMutation.mutate(wh.id); }} className="text-sm text-destructive hover:underline">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
