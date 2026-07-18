"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => api.get<any>("/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-32 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Welcome to SmartERP AI</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Active Users</p>
          <p className="mt-2 text-3xl font-bold">{data?.overview?.totalUsers || 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Branches</p>
          <p className="mt-2 text-3xl font-bold">{data?.overview?.totalBranches || 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">Departments</p>
          <p className="mt-2 text-3xl font-bold">{data?.overview?.totalDepartments || 0}</p>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <p className="text-sm text-muted-foreground">System Status</p>
          <p className="mt-2 text-3xl font-bold text-green-600">Online</p>
        </div>
      </div>

      {data?.recentActivity && data.recentActivity.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="border-b p-4">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y">
            {data.recentActivity.map((activity: any) => (
              <div key={activity.id} className="flex items-center justify-between p-4 text-sm">
                <span>
                  {activity.user?.firstName} {activity.user?.lastName} - {activity.action} {activity.entity}
                </span>
                <span className="text-xs text-muted-foreground">
                  {new Date(activity.createdAt).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

