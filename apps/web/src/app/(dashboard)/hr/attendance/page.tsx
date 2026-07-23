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
import { useToast } from "@/hooks/use-toast";

type Attendance = {
  id: string;
  employeeId: string;
  employee?: { firstName: string; lastName: string };
  date: string;
  checkIn: string;
  checkOut: string;
  status: "PRESENT" | "ABSENT" | "LEAVE";
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PRESENT: "default",
  ABSENT: "destructive",
  LEAVE: "secondary",
};

export default function AttendancePage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [form, setForm] = useState({
    employeeId: "",
    date: "",
    checkIn: "",
    checkOut: "",
    status: "PRESENT" as string,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hr", "attendance"],
    queryFn: () => api.get<any>("/hr/attendance"),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["hr", "employees", "list"],
    queryFn: () => api.get<any>("/hr/employees"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/hr/attendance/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["hr", "attendance"] }); toast({ title: "Attendance record deleted" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/attendance", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "attendance"] });
      setDialogOpen(false);
      toast({ title: "Attendance marked successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const columnHelper = createColumnHelper<Attendance>();
  const columns = useMemo(
    () => [
      columnHelper.accessor((r) => (r.employee ? `${r.employee.firstName} ${r.employee.lastName}` : r.employeeId), {
        id: "employee",
        header: "Employee Name",
        enableSorting: true,
      }),
      columnHelper.accessor("date", { header: "Date", enableSorting: true }),
      columnHelper.accessor("checkIn", {
        header: "Check In",
        cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleTimeString() : "-",
      }),
      columnHelper.accessor("checkOut", {
        header: "Check Out",
        cell: (info) => info.getValue() ? new Date(info.getValue()).toLocaleTimeString() : "-",
      }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={statusVariant[info.getValue()] || "outline"}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <button onClick={() => { if (confirm("Delete this attendance record?")) deleteMutation.mutate(row.original.id); }} className="text-sm text-destructive hover:underline">Delete</button>
        ),
      }),
    ],
    [],
  );

  const records = useMemo(() => data?.data || [], [data]);
  const filterDate = useMemo(
    () =>
      records.filter((r: Attendance) => {
        if (startDate && r.date < startDate) return false;
        if (endDate && r.date > endDate) return false;
        return true;
      }),
    [records, startDate, endDate],
  );

  const table = useReactTable({
    data: filterDate,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { sorting: [{ id: "date", desc: true }] },
  });

  const employees = useMemo(() => employeesData?.data || [], [employeesData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Attendance</h1>
          <p className="text-sm text-muted-foreground">Track employee attendance records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>Mark Attendance</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Mark Attendance</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee</label>
                <select
                  value={form.employeeId}
                  onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                >
                  <option value="">Select employee...</option>
                  {employees.map((emp: any) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.firstName} {emp.lastName} ({emp.employeeCode})
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check In</label>
                  <input
                    type="datetime-local"
                    value={form.checkIn}
                    onChange={(e) => setForm({ ...form, checkIn: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Check Out</label>
                  <input
                    type="datetime-local"
                    value={form.checkOut}
                    onChange={(e) => setForm({ ...form, checkOut: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="PRESENT">Present</option>
                  <option value="ABSENT">Absent</option>
                  <option value="LEAVE">Leave</option>
                </select>
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Saving..." : "Save Attendance"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <span className="text-sm text-muted-foreground">to</span>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
      </div>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
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
            {table.getRowModel().rows.map((row) => (
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
    </div>
  );
}

