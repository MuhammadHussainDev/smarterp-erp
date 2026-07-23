"use client";



export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

type LeaveType = {
  id: string;
  name: string;
  daysAllowed: number;
};

type LeaveRequest = {
  id: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string };
  leaveTypeId: string;
  leaveType?: { name: string };
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
};

const requestStatusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  APPROVED: "default",
  PENDING: "secondary",
  REJECTED: "destructive",
};

export default function LeavePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [typeDialogOpen, setTypeDialogOpen] = useState(false);
  const [editingType, setEditingType] = useState<any | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [typeForm, setTypeForm] = useState({ name: "", daysAllowed: 0 });
  const [requestForm, setRequestForm] = useState({
    employeeId: "",
    leaveTypeId: "",
    startDate: "",
    endDate: "",
    reason: "",
  });

  const { data: typesData, isLoading: typesLoading } = useQuery({
    queryKey: ["hr", "leave-types"],
    queryFn: () => api.get<any>("/hr/leave-types"),
  });

  const { data: requestsData, isLoading: requestsLoading } = useQuery({
    queryKey: ["hr", "leave-requests"],
    queryFn: () => api.get<any>("/hr/leave-requests"),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["hr", "employees", "list"],
    queryFn: () => api.get<any>("/hr/employees"),
  });

  const typeMutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/leave-types", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leave-types"] });
      setTypeDialogOpen(false);
      toast({ title: "Leave type created" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteTypeMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/hr/leave-types/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leave-types"] });
      toast({ title: "Leave type deleted" });
    },
  });

  const updateTypeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/hr/leave-types/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leave-types"] });
      setTypeDialogOpen(false);
      setEditingType(null);
      setTypeForm({ name: "", daysAllowed: 0 });
      toast({ title: "Leave type updated" });
    },
  });

  const requestMutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/leave-requests", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leave-requests"] });
      setRequestDialogOpen(false);
      toast({ title: "Leave request submitted" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/hr/leave-requests/${id}/status`, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "leave-requests"] });
      toast({ title: "Leave request updated" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const typeColumnHelper = createColumnHelper<LeaveType>();
  const typeColumns = useMemo(
    () => [
      typeColumnHelper.accessor("name", { header: "Name", enableSorting: true }),
      typeColumnHelper.accessor("daysAllowed", { header: "Days Allowed", enableSorting: true }),
      typeColumnHelper.display({
        id: "actions",
        header: "Actions",
        cell: (info) => (
          <div className="flex gap-2">
            <button onClick={() => { setEditingType(info.row.original); setTypeForm({ name: info.row.original.name, daysAllowed: info.row.original.daysAllowed }); setTypeDialogOpen(true); }} className="text-sm text-primary hover:underline">Edit</button>
            <button onClick={() => { if (confirm("Delete this leave type?")) deleteTypeMutation.mutate(info.row.original.id); }} className="text-sm text-destructive hover:underline">Delete</button>
          </div>
        ),
      }),
    ],
    [],
  );

  const requestColumnHelper = createColumnHelper<LeaveRequest>();
  const requestColumns = useMemo(
    () => [
      requestColumnHelper.accessor(
        (r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId),
        { id: "employee", header: "Employee", enableSorting: true },
      ),
      requestColumnHelper.accessor(
        (r) => (r.leaveType ? r.leaveType.name : r.leaveTypeId),
        { id: "type", header: "Type", enableSorting: true },
      ),
      requestColumnHelper.accessor("startDate", { header: "Start Date", enableSorting: true }),
      requestColumnHelper.accessor("endDate", { header: "End Date", enableSorting: true }),
      requestColumnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={requestStatusVariant[info.getValue()] || "outline"}>
            {info.getValue()}
          </Badge>
        ),
      }),
      requestColumnHelper.display({
        id: "actions",
        header: "",
        cell: (info) => {
          const status = info.row.original.status;
          if (status !== "PENDING") return null;
          return (
            <div className="flex gap-1">
              <button
                onClick={() => statusMutation.mutate({ id: info.row.original.id, status: "APPROVED" })}
                className="rounded bg-green-100 px-2 py-1 text-xs text-green-700 hover:bg-green-200"
              >
                Approve
              </button>
              <button
                onClick={() => statusMutation.mutate({ id: info.row.original.id, status: "REJECTED" })}
                className="rounded bg-red-100 px-2 py-1 text-xs text-red-700 hover:bg-red-200"
              >
                Reject
              </button>
            </div>
          );
        },
      }),
    ],
    [],
  );

  const leaveTypes = useMemo(() => typesData?.data || [], [typesData]);
  const leaveRequests = useMemo(() => requestsData?.data || [], [requestsData]);
  const employees = useMemo(() => employeesData?.data || [], [employeesData]);

  const typeTable = useReactTable({
    data: leaveTypes,
    columns: typeColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  const requestTable = useReactTable({
    data: leaveRequests,
    columns: requestColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { sorting: [{ id: "startDate", desc: true }] },
  });

  const handleTypeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingType) {
      updateTypeMutation.mutate({ id: editingType.id, data: typeForm });
    } else {
      typeMutation.mutate(typeForm);
    }
  };

  const handleRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    requestMutation.mutate(requestForm);
  };

  if (typesLoading && requestsLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leave Management</h1>
        <p className="text-sm text-muted-foreground">Manage leave types and requests</p>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          <TabsTrigger value="types">Leave Types</TabsTrigger>
          <TabsTrigger value="requests">Requests</TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-4">
          <div className="flex justify-end">
              <Dialog open={typeDialogOpen} onOpenChange={(open) => { setTypeDialogOpen(open); if (!open) { setEditingType(null); setTypeForm({ name: "", daysAllowed: 0 }); } }}>
              <DialogTrigger asChild>
                <Button>New Leave Type</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingType ? "Edit Leave Type" : "New Leave Type"}</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleTypeSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name</label>
                    <input
                      value={typeForm.name}
                      onChange={(e) => setTypeForm({ ...typeForm, name: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Days Allowed</label>
                    <input
                      type="number"
                      value={typeForm.daysAllowed}
                      onChange={(e) => setTypeForm({ ...typeForm, daysAllowed: +e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={typeMutation.isPending} className="w-full">
                    {typeMutation.isPending ? "Creating..." : "Create Leave Type"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                {typeTable.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b text-left text-sm font-medium">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="p-4 cursor-pointer select-none"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y text-sm">
                {typeTable.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>

        <TabsContent value="requests" className="space-y-4">
          <div className="flex justify-end">
            <Dialog open={requestDialogOpen} onOpenChange={setRequestDialogOpen}>
              <DialogTrigger asChild>
                <Button>New Request</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                  <DialogTitle>New Leave Request</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Employee</label>
                    <select
                      value={requestForm.employeeId}
                      onChange={(e) => setRequestForm({ ...requestForm, employeeId: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select employee...</option>
                      {employees.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.firstName} {emp.lastName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Leave Type</label>
                    <select
                      value={requestForm.leaveTypeId}
                      onChange={(e) => setRequestForm({ ...requestForm, leaveTypeId: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      required
                    >
                      <option value="">Select type...</option>
                      {leaveTypes.map((lt: any) => (
                        <option key={lt.id} value={lt.id}>
                          {lt.name} ({lt.daysAllowed} days)
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Start Date</label>
                      <input
                        type="date"
                        value={requestForm.startDate}
                        onChange={(e) => setRequestForm({ ...requestForm, startDate: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">End Date</label>
                      <input
                        type="date"
                        value={requestForm.endDate}
                        onChange={(e) => setRequestForm({ ...requestForm, endDate: e.target.value })}
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Reason</label>
                    <textarea
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({ ...requestForm, reason: e.target.value })}
                      className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      rows={3}
                    />
                  </div>
                  <Button type="submit" disabled={requestMutation.isPending} className="w-full">
                    {requestMutation.isPending ? "Submitting..." : "Submit Request"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                {requestTable.getHeaderGroups().map((hg) => (
                  <tr key={hg.id} className="border-b text-left text-sm font-medium">
                    {hg.headers.map((h) => (
                      <th
                        key={h.id}
                        className="p-4 cursor-pointer select-none"
                        onClick={h.column.getToggleSortingHandler()}
                      >
                        {flexRender(h.column.columnDef.header, h.getContext())}
                        {{ asc: " ↑", desc: " ↓" }[h.column.getIsSorted() as string] ?? ""}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody className="divide-y text-sm">
                {requestTable.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

