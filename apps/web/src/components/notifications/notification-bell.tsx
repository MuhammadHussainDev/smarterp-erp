"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => api.get("/notifications/unread-count"),
    refetchInterval: 30000,
  });
  const unreadCount = (unreadData as any)?.count ?? 0;

  const { data: notifData } = useQuery({
    queryKey: ["notifications", "recent"],
    queryFn: () => api.get("/notifications?page=1&limit=5"),
    enabled: open,
  });
  const notifications = (notifData as any)?.data ?? [];

  const markReadMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/notifications/${id}/read`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const formatTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return "just now";
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  return (
    <div ref={ref} className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => setOpen(!open)}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </Button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 rounded-md border bg-background shadow-lg z-50">
          <div className="flex items-center justify-between p-3 border-b">
            <h3 className="font-semibold text-sm">Notifications</h3>
            <Link href="/notifications" className="text-xs text-primary hover:underline" onClick={() => setOpen(false)}>
              View all
            </Link>
          </div>
          <div className="max-h-72 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">No notifications</p>
            ) : (
              notifications.map((n: any) => (
                <div
                  key={n.id}
                  className={`p-3 border-b last:border-0 cursor-pointer hover:bg-muted/50 ${!n.isRead ? "bg-muted/30" : ""}`}
                  onClick={() => { if (!n.isRead) markReadMutation.mutate(n.id); }}
                >
                  <div className="flex items-start gap-2">
                    <div className={`mt-1 h-2 w-2 rounded-full shrink-0 ${n.isRead ? "bg-transparent" : "bg-blue-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{n.title}</p>
                      {n.message && <p className="text-xs text-muted-foreground truncate">{n.message}</p>}
                      <p className="text-xs text-muted-foreground mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
