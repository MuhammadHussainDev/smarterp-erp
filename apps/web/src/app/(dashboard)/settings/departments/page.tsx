"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DepartmentsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", branchId: "" });

  const { data: departments, isLoading } = useQuery({
    queryKey: ["departments"],
    queryFn: () => api.get<any>("/companies/departments"),
  });

  const { data: branches } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get<any>("/companies/branches"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/companies/departments", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["departments"] });
      setShowForm(false);
      setForm({ name: "", branchId: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/departments/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["departments"] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/companies/departments/${id}`, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["departments"] }); setEditingId(null); setForm({ name: "", branchId: "" }); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Departments</h1>
          <p className="text-sm text-muted-foreground">Manage departments</p>
        </div>
        <button onClick={() => { setEditingId(null); setShowForm(!showForm); setForm({ name: "", branchId: "" }); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Department"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); editingId ? updateMutation.mutate({ id: editingId, data: form }) : mutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input name="name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Branch</label>
              <select name="branchId" value={form.branchId} onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">No branch</option>
                {branches?.data?.map((b: any) => <option key={b.id} value={b.id}>{b.name}</option>)}
              </select>
            </div>
          </div>
          <button type="submit" disabled={editingId ? updateMutation.isPending : mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {editingId ? (updateMutation.isPending ? "Saving..." : "Save") : (mutation.isPending ? "Creating..." : "Create Department")}
          </button>
        </form>
      )}

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">Branch</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {departments?.data?.map((dept: any) => (
              <tr key={dept.id}>
                <td className="p-4">{dept.name}</td>
                <td className="p-4 text-muted-foreground">{dept.branch?.name || "-"}</td>
                <td className="p-4">
                  <button onClick={() => { setEditingId(dept.id); setForm({ name: dept.name, branchId: dept.branchId || "" }); setShowForm(true); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                  <button onClick={() => deleteMutation.mutate(dept.id)}
                    className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

