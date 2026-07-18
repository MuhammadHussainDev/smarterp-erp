"use client";



export const dynamic = "force-dynamic";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function UsersPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api.get<any>("/users"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["users"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-sm text-muted-foreground">Manage company users</p>
        </div>
        <Link href="/settings/users/new"
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Add User
        </Link>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Name</th>
              <th className="p-4">Email</th>
              <th className="p-4">Roles</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((user: any) => (
              <tr key={user.id}>
                <td className="p-4">{user.firstName} {user.lastName}</td>
                <td className="p-4 text-muted-foreground">{user.email}</td>
                <td className="p-4">
                  {user.roles?.map((r: any) => (
                    <span key={r.id} className="mr-1 rounded-full bg-muted px-2 py-0.5 text-xs">
                      {r.name}
                    </span>
                  ))}
                </td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${
                    user.status === "ACTIVE" ? "bg-green-100 text-green-700" :
                    user.status === "INVITED" ? "bg-yellow-100 text-yellow-700" :
                    "bg-gray-100 text-gray-700"
                  }`}>
                    {user.status}
                  </span>
                </td>
                <td className="p-4">
                  <Link href={`/settings/users/${user.id}`}
                    className="mr-2 text-sm text-primary hover:underline">Edit</Link>
                  <button onClick={() => deleteMutation.mutate(user.id)}
                    className="text-sm text-destructive hover:underline">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {data?.meta && (
          <div className="border-t p-4 text-sm text-muted-foreground">
            Page {data.meta.page} of {data.meta.totalPages} ({data.meta.total} total)
          </div>
        )}
      </div>
    </div>
  );
}

