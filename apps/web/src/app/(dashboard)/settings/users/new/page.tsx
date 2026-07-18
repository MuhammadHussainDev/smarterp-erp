"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function NewUserPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", phone: "", roleIds: [] as string[] });

  const { data: roles } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get<any[]>("/roles"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/users", data),
    onSuccess: () => router.push("/settings/users"),
  });

  function toggleRole(roleId: string) {
    setForm({
      ...form,
      roleIds: form.roleIds.includes(roleId)
        ? form.roleIds.filter((id) => id !== roleId)
        : [...form.roleIds, roleId],
    });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    mutation.mutate(form);
  }

  return (
    <div className="max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Create User</h1>
        <p className="text-sm text-muted-foreground">Add a new user to your company</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="block text-sm font-medium">First Name</label>
            <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium">Last Name</label>
            <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} required
              className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium">Phone</label>
          <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="mt-1 block w-full rounded-md border border-input bg-background px-3 py-2 text-sm" />
        </div>

        <div>
          <label className="block text-sm font-medium">Roles</label>
          <div className="mt-2 space-y-2">
            {roles?.map((role: any) => (
              <label key={role.id} className="flex items-center gap-2">
                <input type="checkbox" checked={form.roleIds.includes(role.id)}
                  onChange={() => toggleRole(role.id)}
                  className="rounded border-input" />
                <span className="text-sm">{role.name}</span>
              </label>
            ))}
          </div>
        </div>

        <button type="submit" disabled={mutation.isPending}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
          {mutation.isPending ? "Creating..." : "Create User"}
        </button>

        {mutation.isError && (
          <p className="text-sm text-destructive">{(mutation.error as Error).message}</p>
        )}
      </form>
    </div>
  );
}

