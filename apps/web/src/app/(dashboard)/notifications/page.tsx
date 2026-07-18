"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

const typeIcons: Record<string, string> = {
  INFO: "i",
  WARNING: "!",
  ERROR: "x",
  SUCCESS: "\u2713",
};

const typeColors: Record<string, string> = {
  INFO: "bg-blue-100 text-blue-700",
  WARNING: "bg-yellow-100 text-yellow-700",
  ERROR: "bg-red-100 text-red-700",
  SUCCESS: "bg-green-100 text-green-700",
};

export default function NotificationsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const limit = 15;

  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "list", page],
    queryFn: () => api.get<any>(`/notifications?page=${page}&limit=${limit}`),
  });

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/notifications/unread-count"),
  });
  const unreadCount = (unreadData as any)?.count ?? 0;

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => api.post("/notifications/mark-all-read", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "All notifications marked as read" });
    },
  });

  const clearAllMutation = useMutation({
    mutationFn: () => api.delete("/notifications/read"),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast({ title: "Read notifications cleared" });
    },
  });

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? "s" : ""}` : "No unread notifications"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={() => markAllReadMutation.mutate()}
              disabled={markAllReadMutation.isPending}
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
            >
              {markAllReadMutation.isPending ? "Marking..." : "Mark all as read"}
            </button>
          )}
          <button
            onClick={() => clearAllMutation.mutate()}
            disabled={clearAllMutation.isPending}
            className="rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent disabled:opacity-50"
          >
            {clearAllMutation.isPending ? "Clearing..." : "Clear all"}
          </button>
        </div>
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            <tr className="border-b text-left text-sm font-medium">
              <th className="p-4 w-10" />
              <th className="p-4">Type</th>
              <th className="p-4">Title</th>
              <th className="p-4 hidden md:table-cell">Message</th>
              <th className="p-4">Time</th>
              <th className="p-4">Status</th>
              <th className="p-4 w-20">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y text-sm">
            {data?.data?.map((n: any) => (
              <tr key={n.id} className={!n.isRead ? "bg-muted/30" : ""}>
                <td className="p-4">
                  <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${typeColors[n.type] || "bg-gray-100 text-gray-700"}`}>
                    {typeIcons[n.type] || "?"}
                  </span>
                </td>
                <td className="p-4 font-medium">{n.title}</td>
                <td className="p-4 text-muted-foreground hidden md:table-cell max-w-xs truncate">{n.message || "-"}</td>
                <td className="p-4 text-muted-foreground whitespace-nowrap">{formatTime(n.createdAt)}</td>
                <td className="p-4">
                  <span className={`inline-flex h-2 w-2 rounded-full ${n.isRead ? "bg-transparent" : "bg-blue-500"}`} />
                  <span className="ml-1.5 text-xs text-muted-foreground">{n.isRead ? "Read" : "New"}</span>
                </td>
                <td className="p-4">
                  {!n.isRead && (
                    <button
                      onClick={() => markReadMutation.mutate(n.id)}
                      disabled={markReadMutation.isPending}
                      className="text-sm text-primary hover:underline disabled:opacity-50"
                    >
                      Mark read
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.totalPages && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-sm text-muted-foreground">
            Page {page} of {data.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            disabled={page >= data.totalPages}
            className="rounded-md border border-input bg-background px-3 py-1.5 text-sm hover:bg-accent disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

