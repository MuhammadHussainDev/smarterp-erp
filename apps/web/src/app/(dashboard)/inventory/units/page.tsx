"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function UnitsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", abbreviation: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["units"],
    queryFn: () => api.get<any[]>("/inventory/units"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/units", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["units"] }); setShowForm(false); setForm({ name: "", abbreviation: "" }); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Units</h1>
          <p className="text-sm text-muted-foreground">Manage measurement units</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Unit"}
        </button>
      </div>

      {showForm && (
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

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">Abbreviation</th>
              <th className="p-4">Products</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.map((u: any) => (
              <tr key={u.id}>
                <td className="p-4 font-medium">{u.name}</td>
                <td className="p-4 font-mono text-muted-foreground">{u.abbreviation}</td>
                <td className="p-4 text-muted-foreground">{u._count?.products || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

