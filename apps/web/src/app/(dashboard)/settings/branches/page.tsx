"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function BranchesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", address: "", phone: "" });

  const { data: branches, isLoading } = useQuery({
    queryKey: ["branches"],
    queryFn: () => api.get<any>("/companies/branches"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/companies/branches", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      setShowForm(false);
      setForm({ name: "", address: "", phone: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/companies/branches/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Branches</h1>
          <p className="text-sm text-muted-foreground">Manage your company branches</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          {showForm ? "Cancel" : "Add Branch"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate(form); }}
          className="space-y-4 rounded-lg border bg-card p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <label className="block text-sm font-medium">Name</label>
              <input name="name" value={form.name} onChange={handleChange} required
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Address</label>
              <input name="address" value={form.address} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange}
                className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create Branch"}
          </button>
        </form>
      )}

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">Address</th>
              <th className="p-4">Phone</th>
              <th className="p-4">Departments</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {branches?.data?.map((branch: any) => (
              <tr key={branch.id}>
                <td className="p-4">{branch.name}</td>
                <td className="p-4 text-muted-foreground">{branch.address || "-"}</td>
                <td className="p-4 text-muted-foreground">{branch.phone || "-"}</td>
                <td className="p-4">{branch._count?.departments || 0}</td>
                <td className="p-4">
                  <button onClick={() => deleteMutation.mutate(branch.id)}
                    className="text-sm text-destructive hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

