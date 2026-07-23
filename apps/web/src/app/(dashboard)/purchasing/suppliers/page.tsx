"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function SuppliersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["suppliers"],
    queryFn: () => api.get<any>("/purchasing/suppliers"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/purchasing/suppliers", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["suppliers"] }); setShowForm(false); setForm({ name: "", email: "", phone: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/purchasing/suppliers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["suppliers"] }); setEditingId(null); setForm({ name: "", email: "", phone: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/purchasing/suppliers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["suppliers"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Suppliers</h1>
          <p className="text-sm text-muted-foreground">Manage your suppliers and vendors</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowForm(!showForm); setForm({ name: "", email: "", phone: "" }); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Supplier"}
        </button>
      </div>

      {(showForm || editingId) && (
        <form onSubmit={(e) => { e.preventDefault(); editingId ? updateMutation.mutate({ id: editingId, data: form }) : mutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={mutation.isPending || updateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {editingId ? (updateMutation.isPending ? "Saving..." : "Save") : (mutation.isPending ? "Creating..." : "Create Supplier")}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setShowForm(false); setForm({ name: "", email: "", phone: "" }); }}
              className="rounded-md border px-4 py-2 text-sm text-muted-foreground hover:bg-muted">
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
              <th className="p-4">Email</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((s: any) => (
              <tr key={s.id}>
                <td className="p-4 font-medium">{s.name}</td>
                <td className="p-4 text-muted-foreground">{s.email || "-"}</td>
                <td className="p-4 text-muted-foreground">{s.phone || "-"}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${s.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-4">
                  <button onClick={() => { setEditingId(s.id); setForm({ name: s.name, email: s.email || "", phone: s.phone || "" }); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                  <button onClick={() => { if (confirm("Delete this supplier?")) deleteMutation.mutate(s.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
