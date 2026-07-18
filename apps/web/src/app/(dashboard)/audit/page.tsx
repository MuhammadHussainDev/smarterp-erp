"use client";



export const dynamic = "force-dynamic";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

const ACTION_COLORS: Record<string, string> = {
  CREATE: "bg-green-100 text-green-700",
  UPDATE: "bg-blue-100 text-blue-700",
  DELETE: "bg-red-100 text-red-700",
  LOGIN: "bg-purple-100 text-purple-700",
  LOGOUT: "bg-gray-100 text-gray-700",
};

export default function AuditPage() {
  const [filters, setFilters] = useState({
    action: "",
    entity: "",
    userId: "",
    startDate: "",
    endDate: "",
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const debouncedFilters = useDebounce(filters, 400);

  const queryString = useMemo(() => {
    const params = new URLSearchParams();
    Object.entries(debouncedFilters).forEach(([key, val]) => {
      if (val) params.set(key, val);
    });
    return params.toString();
  }, [debouncedFilters]);

  const { data, isLoading } = useQuery({
    queryKey: ["audit-logs", queryString],
    queryFn: () => api.get<any>(`/audit?${queryString}`),
  });

  const updateFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const logs: any[] = data?.data ?? [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Audit Log</h1>
          <p className="text-sm text-muted-foreground">
            Track all changes and activities across the system
          </p>
        </div>
        <Button variant="outline" onClick={() => window.open("/export/audit-log", "_blank")}>
          Export
        </Button>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border bg-card p-4">
        <Input
          placeholder="Action"
          className="w-32"
          value={filters.action}
          onChange={(e) => updateFilter("action", e.target.value)}
        />
        <Input
          placeholder="Entity"
          className="w-36"
          value={filters.entity}
          onChange={(e) => updateFilter("entity", e.target.value)}
        />
        <Input
          placeholder="User ID"
          className="w-32"
          value={filters.userId}
          onChange={(e) => updateFilter("userId", e.target.value)}
        />
        <Input
          type="date"
          className="w-40"
          value={filters.startDate}
          onChange={(e) => updateFilter("startDate", e.target.value)}
        />
        <Input
          type="date"
          className="w-40"
          value={filters.endDate}
          onChange={(e) => updateFilter("endDate", e.target.value)}
        />
      </div>

      {isLoading ? (
        <div className="h-48 animate-pulse rounded-lg bg-muted" />
      ) : (
        <div className="rounded-lg border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>Entity ID</TableHead>
                <TableHead>IP Address</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log: any) => (
                <>
                  <TableRow
                    key={log.id}
                    className="cursor-pointer"
                    onClick={() => setExpandedRow(expandedRow === log.id ? null : log.id)}
                  >
                    <TableCell className="font-mono text-xs">
                      {new Date(log.timestamp).toLocaleString()}
                    </TableCell>
                    <TableCell>{log.user?.name ?? log.user?.email ?? log.userId}</TableCell>
                    <TableCell>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          ACTION_COLORS[log.action] ?? "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {log.action}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">{log.entity}</TableCell>
                    <TableCell className="font-mono text-xs">{log.entityId}</TableCell>
                    <TableCell className="font-mono text-xs text-muted-foreground">
                      {log.ipAddress ?? "-"}
                    </TableCell>
                  </TableRow>
                  {expandedRow === log.id && (
                    <TableRow key={`${log.id}-detail`}>
                      <TableCell colSpan={6} className="bg-muted/30 p-4">
                        <div className="space-y-3">
                          {log.oldData && (
                            <div>
                              <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                                Old Data
                              </h4>
                              <pre className="max-h-40 overflow-auto rounded bg-background p-2 text-xs font-mono">
                                {JSON.stringify(log.oldData, null, 2)}
                              </pre>
                            </div>
                          )}
                          {log.newData && (
                            <div>
                              <h4 className="mb-1 text-xs font-semibold text-muted-foreground">
                                New Data
                              </h4>
                              <pre className="max-h-40 overflow-auto rounded bg-background p-2 text-xs font-mono">
                                {JSON.stringify(log.newData, null, 2)}
                              </pre>
                            </div>
                          )}
                          {!log.oldData && !log.newData && (
                            <p className="text-xs text-muted-foreground">No detail data available.</p>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </>
              ))}
              {logs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-sm text-muted-foreground">
                    No audit logs found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}

