"use client";



export const dynamic = "force-dynamic";

import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  SortingState,
} from "@tanstack/react-table";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

export default function BudgetsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    fiscalYear: new Date().getFullYear(),
    accountId: "",
    amount: 0,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["budgets"],
    queryFn: () => api.get<any>("/accounting/budgets"),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.get<any>("/accounting/accounts"),
    enabled: dialogOpen,
  });

  const budgets = data?.data ?? [];
  const accounts = accountsData?.data ?? [];

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/accounting/budgets", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      setDialogOpen(false);
      setForm({ fiscalYear: new Date().getFullYear(), accountId: "", amount: 0 });
      toast({ title: "Budget created", description: "The budget has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const columns = useMemo(
    () => [
      { accessorKey: "fiscalYear", header: "Fiscal Year" },
      {
        accessorKey: "account",
        header: "Account",
        cell: ({ getValue }: any) => {
          const acct = getValue() as any;
          return acct ? `${acct.code} - ${acct.name}` : "-";
        },
      },
      {
        accessorKey: "amount",
        header: "Amount",
        cell: ({ getValue }: any) => `$${Number(getValue()).toLocaleString(undefined, { minimumFractionDigits: 2 })}`,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: budgets,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Budgets</h1>
          <p className="text-sm text-muted-foreground">Manage annual budgets by account</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Budget</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Create Budget</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  fiscalYear: +form.fiscalYear,
                  accountId: form.accountId,
                  amount: +form.amount,
                });
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Label htmlFor="fiscalYear">Fiscal Year</Label>
                <Input
                  id="fiscalYear"
                  type="number"
                  min="2000"
                  max="2100"
                  value={form.fiscalYear}
                  onChange={(e) => setForm({ ...form, fiscalYear: +e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="accountId">Account</Label>
                <Select
                  value={form.accountId}
                  onValueChange={(v) => setForm({ ...form, accountId: v })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((a: any) => (
                      <SelectItem key={a.id} value={a.id}>
                        {a.code} - {a.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={form.amount || ""}
                  onChange={(e) => setForm({ ...form, amount: +e.target.value })}
                  required
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Budget"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? null}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

