"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function LeadsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ contactName: "", companyName: "", email: "", phone: "", source: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["leads"],
    queryFn: () => api.get<any>("/crm/leads"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/crm/leads", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leads"] }); setShowForm(false); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/crm/leads/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["leads"] }); setEditingId(null); setForm({ contactName: "", companyName: "", email: "", phone: "", source: "" }); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/crm/leads/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const convertMutation = useMutation({
    mutationFn: (id: string) => api.post(`/crm/leads/${id}/convert`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["leads"] }),
  });

  const statusColors: Record<string, string> = {
    NEW: "bg-blue-100 text-blue-700", CONTACTED: "bg-yellow-100 text-yellow-700",
    QUALIFIED: "bg-green-100 text-green-700", PROPOSAL: "bg-purple-100 text-purple-700", LOST: "bg-gray-100 text-gray-700",
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Leads</h1>
          <p className="text-sm text-muted-foreground">Track and manage sales leads</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Lead"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); createMutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-4">
            <input placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <button type="submit" disabled={createMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {createMutation.isPending ? "Creating..." : "Create Lead"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, data: form }); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Edit Lead</h2>
          <div className="grid gap-4 md:grid-cols-4">
            <input placeholder="Contact name" value={form.contactName} onChange={(e) => setForm({ ...form, contactName: e.target.value })} required
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
            <input placeholder="Source" value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })}
              className="rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div className="flex gap-2">
            <button type="submit" disabled={updateMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
              {updateMutation.isPending ? "Saving..." : "Save"}
            </button>
            <button type="button" onClick={() => { setEditingId(null); setForm({ contactName: "", companyName: "", email: "", phone: "", source: "" }); }}
              className="rounded-md border border-input px-4 py-2 text-sm hover:bg-muted">
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Contact</th>
              <th className="p-4">Company</th>
              <th className="p-4">Email</th>
              <th className="p-4">Source</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((lead: any) => (
              <tr key={lead.id}>
                <td className="p-4 font-medium">{lead.contactName}</td>
                <td className="p-4 text-muted-foreground">{lead.companyName || "-"}</td>
                <td className="p-4 text-muted-foreground">{lead.email || "-"}</td>
                <td className="p-4">{lead.source || "-"}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[lead.status] || ""}`}>
                    {lead.status}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    {lead.status !== "LOST" && lead.status !== "QUALIFIED" && (
                      <button onClick={() => convertMutation.mutate(lead.id)}
                        className="text-sm text-primary hover:underline">Convert</button>
                    )}
                    <button onClick={() => { setEditingId(lead.id); setForm({ contactName: lead.contactName, companyName: lead.companyName || "", email: lead.email || "", phone: lead.phone || "", source: lead.source || "" }); }}
                      className="text-sm text-primary hover:underline">Edit</button>
                    <button onClick={() => { if (confirm("Delete this lead?")) deleteMutation.mutate(lead.id); }}
                      className="text-sm text-destructive hover:underline">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
