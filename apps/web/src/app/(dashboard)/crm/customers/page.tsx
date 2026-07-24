"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function CustomersPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", industry: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get<any>("/crm/customers"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/crm/customers", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setShowForm(false); setForm({ name: "", email: "", phone: "", industry: "" }); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/crm/customers/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["customers"] }); setEditingId(null); setForm({ name: "", email: "", phone: "", industry: "" }); },
    onError: (err: Error) => { alert("Update failed: " + err.message); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/customers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["customers"] }),
    onError: (err: Error) => { alert("Delete failed: " + err.message); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customers</h1>
          <p className="text-sm text-muted-foreground">Manage your customer records</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setForm({ name: "", email: "", phone: "", industry: "" }); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm || editingId ? "Cancel" : "Add Customer"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <input placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create Customer"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, data: form }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <input placeholder="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={updateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setForm({ name: "", email: "", phone: "", industry: "" }); }}
              className="rounded-md border border-input px-4 py-2 text-sm">
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
              <th className="p-4">Industry</th>
              <th className="p-4">Contacts</th>
              <th className="p-4">Opportunities</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((c: any) => (
              <tr key={c.id}>
                <td className="p-4 font-medium">{c.name}</td>
                <td className="p-4 text-muted-foreground">{c.email || "-"}</td>
                <td className="p-4 text-muted-foreground">{c.phone || "-"}</td>
                <td className="p-4">{c.industry || "-"}</td>
                <td className="p-4">{c._count?.contacts || 0}</td>
                <td className="p-4">{c._count?.opportunities || 0}</td>
                <td className="p-4">
                  <button onClick={() => { setEditingId(c.id); setForm({ name: c.name, email: c.email || "", phone: c.phone || "", industry: c.industry || "" }); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                  <button onClick={() => { if (confirm("Delete this customer?")) deleteMutation.mutate(c.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
