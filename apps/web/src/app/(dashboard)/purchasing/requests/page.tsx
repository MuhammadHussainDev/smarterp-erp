"use client";



export const dynamic = "force-dynamic";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

const statusColors: Record<string, string> = {
  DRAFT: "bg-gray-100 text-gray-700", PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700", REJECTED: "bg-red-100 text-red-700", ORDERED: "bg-blue-100 text-blue-700",
};

export default function PurchaseRequestsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["purchase-requests"],
    queryFn: () => api.get<any>("/purchasing/requests"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/purchasing/requests/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["purchase-requests"] }),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Purchase Requests</h1>
        <p className="text-sm text-muted-foreground">Internal purchase requests</p>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4">Number</th>
              <th className="p-4">Issue Date</th>
              <th className="p-4">Status</th>
              <th className="p-4">Notes</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((pr: any) => (
              <tr key={pr.id}>
                <td className="p-4 font-medium">{pr.number}</td>
                <td className="p-4 text-muted-foreground">{new Date(pr.issueDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusColors[pr.status] || ""}`}>{pr.status}</span>
                </td>
                <td className="p-4 text-muted-foreground">{pr.notes || "-"}</td>
                <td className="p-4">
                  <button onClick={() => { if (confirm("Delete this purchase request?")) deleteMutation.mutate(pr.id); }} className="text-sm text-destructive hover:underline">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

