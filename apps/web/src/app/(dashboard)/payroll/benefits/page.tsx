"use client";



export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

type Benefit = {
  id: string;
  name: string;
  type: "FIXED" | "PERCENTAGE";
  description?: string;
  amount: number;
};

export default function BenefitsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", type: "FIXED" as "FIXED" | "PERCENTAGE", description: "", amount: "" });
  const [showAssign, setShowAssign] = useState(false);
  const [assignForm, setAssignForm] = useState({ employeeId: "", benefitId: "", amount: "" });

  const { data, isLoading } = useQuery({
    queryKey: ["benefits"],
    queryFn: () => api.get<any>("/payroll/benefits"),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get<any>("/employees"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/payroll/benefits", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["benefits"] }); setShowForm(false); setForm({ name: "", type: "FIXED", description: "", amount: "" }); },
  });

  const assignMutation = useMutation({
    mutationFn: (data: any) => api.post("/payroll/benefits/assign", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["benefits"] }); setShowAssign(false); setAssignForm({ employeeId: "", benefitId: "", amount: "" }); },
  });

  const benefits: Benefit[] = useMemo(() => data?.data || [], [data]);
  const employees: any[] = useMemo(() => employeesData?.data || employeesData || [], [employeesData]);

  const columnHelper = createColumnHelper<Benefit>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("name", {
        header: "Name",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("type", {
        header: "Type",
        cell: (info) => (
          <Badge variant={info.getValue() === "FIXED" ? "secondary" : "default"}>
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("amount", {
        header: "Amount",
        cell: (info) => {
          const row = info.row.original;
          return row.type === "PERCENTAGE" ? `${info.getValue()}%` : `$${Number(info.getValue() ?? 0).toFixed(2)}`;
        },
      }),
    ],
    []
  );

  const table = useReactTable({
    data: benefits,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Benefits</h1>
          <p className="text-sm text-muted-foreground">Manage employee benefits and allowances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowAssign(true)}>Assign to Employee</Button>
          <Button onClick={() => setShowForm(true)}>New Benefit</Button>
        </div>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Benefit</DialogTitle>
            <DialogDescription>Create a new benefit type.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as "FIXED" | "PERCENTAGE" })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="FIXED">FIXED</option>
                <option value="PERCENTAGE">PERCENTAGE</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({ ...form, amount: +form.amount })}
              disabled={!form.name || !form.amount || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showAssign} onOpenChange={setShowAssign}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Benefit to Employee</DialogTitle>
            <DialogDescription>Assign a benefit to an employee with a custom amount.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee</label>
              <select
                value={assignForm.employeeId}
                onChange={(e) => setAssignForm({ ...assignForm, employeeId: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select employee</option>
                {(employees || []).map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Benefit</label>
              <select
                value={assignForm.benefitId}
                onChange={(e) => setAssignForm({ ...assignForm, benefitId: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select benefit</option>
                {benefits.map((b) => (
                  <option key={b.id} value={b.id}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                value={assignForm.amount}
                onChange={(e) => setAssignForm({ ...assignForm, amount: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAssign(false)}>Cancel</Button>
            <Button
              onClick={() => assignMutation.mutate({ ...assignForm, amount: +assignForm.amount })}
              disabled={!assignForm.employeeId || !assignForm.benefitId || !assignForm.amount || assignMutation.isPending}
            >
              {assignMutation.isPending ? "Assigning..." : "Assign"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="rounded-lg border bg-card">
        <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((hg) => (
              <tr key={hg.id} className="border-b text-left text-sm font-medium">
                {hg.headers.map((header) => (
                  <th key={header.id} className="p-4">
                    {flexRender(header.column.columnDef.header, header.getContext())}
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
        {benefits.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No benefits yet.</div>
        )}
      </div>
    </div>
  );
}

