"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function BrandsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["brands"],
    queryFn: () => api.get<any>("/inventory/brands"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/brands", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brands"] }); setShowForm(false); setName(""); },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => api.patch(`/inventory/brands/${id}`, { name }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["brands"] }); setEditingId(null); setEditName(""); },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/inventory/brands/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["brands"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Brands</h1>
          <p className="text-sm text-muted-foreground">Manage product brands</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditingId(null); setEditName(""); }}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Brand"}
        </button>
      </div>

      {showForm && !editingId && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name }); }}
          className="flex gap-4 rounded-lg border bg-card p-6">
          <input placeholder="Brand name" value={name} onChange={(e) => setName(e.target.value)} required
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={mutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {mutation.isPending ? "Creating..." : "Create"}
          </button>
        </form>
      )}

      {editingId && (
        <form onSubmit={(e) => { e.preventDefault(); updateMutation.mutate({ id: editingId, name: editName }); }}
          className="flex gap-4 rounded-lg border bg-card p-6">
          <input placeholder="Brand name" value={editName} onChange={(e) => setEditName(e.target.value)} required
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
          <button type="submit" disabled={updateMutation.isPending}
            className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground disabled:opacity-50">
            {updateMutation.isPending ? "Saving..." : "Save"}
          </button>
          <button type="button" onClick={() => { setEditingId(null); setEditName(""); }}
            className="rounded-md border px-4 py-2 text-sm font-medium">
            Cancel
          </button>
        </form>
      )}

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">Products</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((b: any) => (
              <tr key={b.id}>
                <td className="p-4 font-medium">{b.name}</td>
                <td className="p-4 text-muted-foreground">{b._count?.products || 0}</td>
                <td className="p-4">
                  <button onClick={() => { setEditingId(b.id); setEditName(b.name); setShowForm(false); }} className="mr-2 text-sm text-primary hover:underline">Edit</button>
                  <button onClick={() => { if (confirm("Delete this brand?")) deleteMutation.mutate(b.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
