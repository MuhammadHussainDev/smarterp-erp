"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function NewRolePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPerms, setSelectedPerms] = useState<string[]>([]);

  const { data: permissions } = useQuery({
    queryKey: ["permissions"],
    queryFn: () => api.get<any>("/roles/permissions/all"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/roles", data),
    onSuccess: () => router.push("/settings/roles"),
  });

  function togglePerm(id: string) {
    setSelectedPerms((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate({ name, description, permissionIds: selectedPerms });
  }

  const groupedPerms = permissions?.reduce((acc: any, p: any) => {
    (acc[p.module] = acc[p.module] || []).push(p);
    return acc;
  }, {} as Record<string, any[]>);

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create Role</h1>
        <p className="text-sm text-muted-foreground">Define a new role with permissions</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">Role Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-3">Permissions</label>
          {groupedPerms && Object.entries(groupedPerms).map(([module, perms]: [string, any]) => (
            <div key={module} className="mb-4">
              <h4 className="mb-2 text-sm font-medium capitalize text-muted-foreground">{module}</h4>
              <div className="flex flex-wrap gap-2">
                {perms.map((perm: any) => (
                  <label key={perm.id}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${
                      selectedPerms.includes(perm.id)
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted"
                    }`}>
                    <input type="checkbox" checked={selectedPerms.includes(perm.id)}
                      onChange={() => togglePerm(perm.id)} className="hidden" />
                    {perm.name}
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>

        <button type="submit" disabled={mutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {mutation.isPending ? "Creating..." : "Create Role"}
        </button>
      </form>
    </div>
  );
}

