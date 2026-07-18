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

type Employee = {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  departmentId: string;
  position: string;
  hireDate: string;
  salary: number;
  status: "ACTIVE" | "INACTIVE" | "TERMINATED";
};

const statusVariant: Record<string, "default" | "secondary" | "destructive"> = {
  ACTIVE: "default",
  INACTIVE: "secondary",
  TERMINATED: "destructive",
};

export default function EmployeesPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    employeeCode: "",
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    departmentId: "",
    position: "",
    hireDate: "",
    salary: 0,
    status: "ACTIVE" as string,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hr", "employees"],
    queryFn: () => api.get<any>("/hr/employees"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/employees", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "employees"] });
      setDialogOpen(false);
      toast({ title: "Employee created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const columnHelper = createColumnHelper<Employee>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("employeeCode", { header: "Employee Code", enableSorting: true }),
      columnHelper.accessor((r) => `${r.firstName} ${r.lastName}`, {
        id: "name",
        header: "Name",
        enableSorting: true,
      }),
      columnHelper.accessor("departmentId", { header: "Department", enableSorting: true }),
      columnHelper.accessor("position", { header: "Position", enableSorting: true }),
      columnHelper.accessor("email", { header: "Email", enableSorting: true }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={statusVariant[info.getValue()] || "outline"}>
            {info.getValue()}
          </Badge>
        ),
      }),
    ],
    [],
  );

  const employees = useMemo(() => data?.data || [], [data]);
  const filteredData = useMemo(
    () =>
      employees.filter((e: Employee) =>
        !search || `${e.firstName} ${e.lastName} ${e.email}`.toLowerCase().includes(search.toLowerCase())
      ),
    [employees, search],
  );

  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { sorting: [{ id: "employeeCode", desc: false }] },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    mutation.mutate(form);
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Employees</h1>
          <p className="text-sm text-muted-foreground">Manage employee records</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Employee</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Employee</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Employee Code</label>
                  <input
                    value={form.employeeCode}
                    onChange={(e) => setForm({ ...form, employeeCode: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">First Name</label>
                  <input
                    value={form.firstName}
                    onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Last Name</label>
                  <input
                    value={form.lastName}
                    onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Department</label>
                  <input
                    value={form.departmentId}
                    onChange={(e) => setForm({ ...form, departmentId: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Position</label>
                  <input
                    value={form.position}
                    onChange={(e) => setForm({ ...form, position: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Hire Date</label>
                  <input
                    type="date"
                    value={form.hireDate}
                    onChange={(e) => setForm({ ...form, hireDate: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salary</label>
                  <input
                    type="number"
                    step="0.01"
                    value={form.salary}
                    onChange={(e) => setForm({ ...form, salary: +e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                    <option value="TERMINATED">Terminated</option>
                  </select>
                </div>
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Creating..." : "Create Employee"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
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

