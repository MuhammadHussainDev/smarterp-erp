"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function UnitsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", abbreviation: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => api.get<any>("/inventory/units"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/units", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); setShowForm(false); setForm({ name: "", abbreviation: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/inventory/units/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); setEditingId(null); setForm({ name: "", abbreviation: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/units/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["units"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Units</h1>
          <p className="text-sm text-muted-foreground">Manage measurement units</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", abbreviation: "" }); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Unit"}
        </button>
      </div>

      {showForm && !editingId && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="flex gap-4 rounded-lg border bg-card p-6">
          <input placeholder="Unit name (e.g., Kilogram)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Abbrev (e.g., kg)" value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} required
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, data: form }); }}
          className="flex gap-4 rounded-lg border bg-card p-6">
          <input placeholder="Unit name (e.g., Kilogram)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <input placeholder="Abbrev (e.g., kg)" value={form.abbreviation} onChange={(e) => setForm({ ...form, abbreviation: e.target.value })} required
            className="w-32 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={updateMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", abbreviation: "" }); }}
            className="rounded-md border border-input px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
            Cancel
          </button>
        </form>
      )}

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">Abbreviation</th>
              <th className="p-4">Products</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((u: any) => (
              <tr key={u.id}>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 font-mono text-muted-foreground">{u.abbreviation}</td>
                <td className="p-4 text-muted-foreground">{u._count?.products || 0}</td>
                <td className="p-4">
                  <button onClick={() => { setEditingId(u.id); setForm({ name: u.name, abbreviation: u.abbreviation }); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                  <button onClick={() => { if (confirm("Delete this unit?")) deleteMutation.mutate(u.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
