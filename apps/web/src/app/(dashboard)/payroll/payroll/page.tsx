"use client";



export const dynamic = "force-dynamic";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getExpandedRowModel,
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

const statusColors: Record<string, string> = {
  DRAFT: "bg-yellow-100 text-yellow-700 border-yellow-200",
  PROCESSED: "bg-blue-100 text-blue-700 border-blue-200",
  PAID: "bg-green-100 text-green-700 border-green-200",
};

type Payroll = {
  id: string;
  month: number;
  year: number;
  status: string;
  employeeCount: number;
  items?: PayrollItem[];
};

type PayrollItem = {
  id: string;
  employeeName: string;
  basicSalary: number;
  allowances: number;
  deductions: number;
  tax: number;
  netSalary: number;
};

export default function PayrollPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ month: "", year: new Date().getFullYear().toString() });
  const [editingItem, setEditingItem] = useState<PayrollItem | null>(null);
  const [editValues, setEditValues] = useState({ allowances: 0, deductions: 0, tax: 0 });

  const { data, isLoading } = useQuery({
    queryKey: ["payrolls"],
    queryFn: () => api.get<any>("/payroll"),
  });

  const createMutation = useMutation({
    mutationFn: (data: { month: number; year: number }) => api.post("/payroll", data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["payrolls"] }); setShowForm(false); setForm({ month: "", year: new Date().getFullYear().toString() }); },
  });

  const processMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/payroll/${id}/status`, { status: "PROCESSED" }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payrolls"] }),
  });

  const updateItemMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => api.patch(`/payroll/items/${id}`, data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["payrolls"] }),
  });

  const payrolls: Payroll[] = useMemo(() => data?.data || [], [data]);

  const columnHelper = createColumnHelper<Payroll>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("month", {
        header: "Month",
        cell: (info) => {
          const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
          return months[info.getValue() - 1] || info.getValue();
        },
      }),
      columnHelper.accessor("year", { header: "Year" }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge className={statusColors[info.getValue()] || ""} variant="outline">
            {info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("employeeCount", { header: "Employees" }),
      columnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2">
            {row.original.status === "DRAFT" && (
              <Button size="sm" variant="outline" onClick={() => processMutation.mutate(row.original.id)}>
                Process
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              onClick={() => row.toggleExpanded()}
            >
              {row.getIsExpanded() ? "Hide Items" : "View Items"}
            </Button>
          </div>
        ),
      }),
    ],
    [processMutation]
  );

  const table = useReactTable({
    data: payrolls,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getRowCanExpand: () => true,
  });

  const handleEditItem = (item: PayrollItem) => {
    setEditingItem(item);
    setEditValues({ allowances: item.allowances, deductions: item.deductions, tax: item.tax });
  };

  const saveItemEdit = () => {
    if (!editingItem) return;
    updateItemMutation.mutate({
      id: editingItem.id,
      data: editValues,
    });
    setEditingItem(null);
  };

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Payroll</h1>
          <p className="text-sm text-muted-foreground">Process and manage payroll runs</p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Payroll</Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Payroll</DialogTitle>
            <DialogDescription>Create a new payroll run for a specific month and year.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Month</label>
              <select
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select month</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <option key={m} value={m}>
                    {new Date(0, m - 1).toLocaleString("default", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Year</label>
              <input
                type="number"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={() => createMutation.mutate({ month: +form.month, year: +form.year })}
              disabled={!form.month || !form.year || createMutation.isPending}
            >
              {createMutation.isPending ? "Creating..." : "Create"}
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
              <>
                <tr key={row.id} className="hover:bg-muted/50 cursor-pointer">
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
                {row.getIsExpanded() && (
                  <tr key={`${row.id}-expanded`}>
                    <td colSpan={columns.length} className="bg-muted/30 p-4">
                      <div className="space-y-2">
                        <h4 className="font-semibold text-sm">Payroll Items</h4>
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b text-left text-xs font-medium text-muted-foreground">
                              <th className="pb-2 pr-4">Employee</th>
                              <th className="pb-2 pr-4">Basic Salary</th>
                              <th className="pb-2 pr-4">Allowances</th>
                              <th className="pb-2 pr-4">Deductions</th>
                              <th className="pb-2 pr-4">Tax</th>
                              <th className="pb-2 pr-4">Net Salary</th>
                              <th className="pb-2 pr-4"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {(row.original.items || []).map((item: PayrollItem) => (
                              <tr key={item.id}>
                                <td className="py-2 pr-4">{item.employeeName}</td>
                                <td className="py-2 pr-4">${item.basicSalary.toFixed(2)}</td>
                                <td className="py-2 pr-4">
                                  {editingItem?.id === item.id ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editValues.allowances}
                                      onChange={(e) => setEditValues({ ...editValues, allowances: +e.target.value })}
                                      className="w-24 rounded border border-input bg-background px-2 py-1 text-xs"
                                    />
                                  ) : (
                                    `$${item.allowances.toFixed(2)}`
                                  )}
                                </td>
                                <td className="py-2 pr-4">
                                  {editingItem?.id === item.id ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editValues.deductions}
                                      onChange={(e) => setEditValues({ ...editValues, deductions: +e.target.value })}
                                      className="w-24 rounded border border-input bg-background px-2 py-1 text-xs"
                                    />
                                  ) : (
                                    `$${item.deductions.toFixed(2)}`
                                  )}
                                </td>
                                <td className="py-2 pr-4">
                                  {editingItem?.id === item.id ? (
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editValues.tax}
                                      onChange={(e) => setEditValues({ ...editValues, tax: +e.target.value })}
                                      className="w-24 rounded border border-input bg-background px-2 py-1 text-xs"
                                    />
                                  ) : (
                                    `$${item.tax.toFixed(2)}`
                                  )}
                                </td>
                                <td className="py-2 pr-4 font-medium">${item.netSalary.toFixed(2)}</td>
                                <td className="py-2">
                                  {editingItem?.id === item.id ? (
                                    <div className="flex gap-1">
                                      <Button size="sm" onClick={saveItemEdit}>Save</Button>
                                      <Button size="sm" variant="ghost" onClick={() => setEditingItem(null)}>Cancel</Button>
                                    </div>
                                  ) : (
                                    <Button size="sm" variant="ghost" onClick={() => handleEditItem(item)}>Edit</Button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {(!row.original.items || row.original.items.length === 0) && (
                              <tr>
                                <td colSpan={7} className="py-4 text-center text-muted-foreground">No items</td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </>
            ))}
          </tbody>
        </table>
        {payrolls.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No payroll runs yet.</div>
        )}
      </div>
    </div>
  );
}

