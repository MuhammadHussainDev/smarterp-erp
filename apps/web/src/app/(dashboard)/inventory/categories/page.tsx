"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function CategoriesPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: () => api.get<any[]>("/inventory/categories"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/inventory/categories", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["categories"] }); setShowForm(false); setName(""); },
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Categories</h1>
          <p className="text-sm text-muted-foreground">Organize products into categories</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          {showForm ? "Cancel" : "Add Category"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={(e) => { e.preventDefault(); mutation.mutate({ name }); }}
          className="flex gap-4 rounded-lg border bg-card p-6">
          <input placeholder="Category name" value={name} onChange={(e) => setName(e.target.value)} required
            className="flex-1 rounded-md border border-input bg-background px-3 py-2 text-sm" />
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
              <th className="p-4">Products</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((cat: any) => (
              <tr key={cat.id}>
                <td className="p-4 font-medium">{cat.name}</td>
                <td className="p-4 text-muted-foreground">{cat._count?.products || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

