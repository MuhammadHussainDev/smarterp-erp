"use client";



export const dynamic = "force-dynamic";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function RolesPage() {
  const queryClient = useQueryClient();

  const { data: roles, isLoading } = useQuery({
    queryKey: ["roles"],
    queryFn: () => api.get<any>("/roles"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/roles/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["roles"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-sm text-muted-foreground">Manage roles and permissions</p>
        </div>
        <Link href="/settings/roles/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Create Role
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles?.data?.map((role: any) => (
          <div key={role.id} className="rounded-lg border bg-card p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{role.name}</h3>
                <p className="text-sm text-muted-foreground">{role.description || ""}</p>
              </div>
              {role.isSystem && (
                <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">System</span>
              )}
            </div>
            <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
              <span>{role._count?.userRoles || 0} users</span>
              <span>{role.rolePermissions?.length || 0} permissions</span>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href={`/settings/roles/${role.id}`}
                className="text-sm text-primary hover:underline">Edit</Link>
              {!role.isSystem && (
                <button onClick={() => deleteMutation.mutate(role.id)}
                  className="text-sm text-destructive hover:underline">Delete</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

