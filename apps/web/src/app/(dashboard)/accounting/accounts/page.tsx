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
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const ACCOUNT_TYPES = [
  { value: "ASSET", label: "Asset", color: "bg-blue-100 text-blue-700" },
  { value: "LIABILITY", label: "Liability", color: "bg-orange-100 text-orange-700" },
  { value: "EQUITY", label: "Equity", color: "bg-green-100 text-green-700" },
  { value: "REVENUE", label: "Revenue", color: "bg-emerald-100 text-emerald-700" },
  { value: "EXPENSE", label: "Expense", color: "bg-red-100 text-red-700" },
];

export default function AccountsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    code: "",
    name: "",
    type: "",
    parentId: "",
    description: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.get<any>("/accounting/accounts"),
  });

  const accounts = data?.data ?? [];

  const { data: parentData } = useQuery({
    queryKey: ["accounts", "parents"],
    queryFn: () => api.get<any>("/accounting/accounts"),
    enabled: dialogOpen,
  });

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/accounting/accounts", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
      setDialogOpen(false);
      setForm({ code: "", name: "", type: "", parentId: "", description: "" });
      toast({ title: "Account created", description: "The account has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      api.patch(`/accounting/accounts/${id}`, { isActive }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["accounts"] });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const columns = useMemo(
    () => [
      { accessorKey: "code", header: "Code" },
      { accessorKey: "name", header: "Name" },
      {
        accessorKey: "type",
        header: "Type",
        cell: ({ getValue }: any) => {
          const type = getValue() as string;
          const t = ACCOUNT_TYPES.find((a) => a.value === type);
          return <Badge className={t?.color ?? ""}>{t?.label ?? type}</Badge>;
        },
      },
      {
        accessorKey: "isActive",
        header: "Status",
        cell: ({ row }: any) => (
          <Switch
            checked={row.original.isActive}
            onCheckedChange={(checked) =>
              toggleMutation.mutate({ id: row.original.id, isActive: checked })
            }
          />
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: accounts,
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
          <h1 className="text-2xl font-bold">Chart of Accounts</h1>
          <p className="text-sm text-muted-foreground">Manage your chart of accounts</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Account</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Account</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...form,
                  parentId: form.parentId || undefined,
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    placeholder="e.g. 1000"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g. Cash"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <Select
                    value={form.type}
                    onValueChange={(v) => setForm({ ...form, type: v })}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {ACCOUNT_TYPES.map((t) => (
                        <SelectItem key={t.value} value={t.value}>
                          {t.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parentId">Parent Account</Label>
                  <Select
                    value={form.parentId}
                    onValueChange={(v) => setForm({ ...form, parentId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="None (top-level)" />
                    </SelectTrigger>
                    <SelectContent>
                      {parentData?.data?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Optional description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Creating..." : "Create Account"}
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
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                    {{ asc: " ↑", desc: " ↓" }[
                      header.column.getIsSorted() as string
                    ] ?? null}
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

