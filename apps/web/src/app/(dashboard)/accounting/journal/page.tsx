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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

interface LineItem {
  accountId: string;
  description: string;
  debit: number;
  credit: number;
}

export default function JournalPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [sorting, setSorting] = useState<SortingState>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [form, setForm] = useState({
    date: new Date().toISOString().split("T")[0],
    description: "",
    reference: "",
    lineItems: [] as LineItem[],
  });

  const { data, isLoading } = useQuery({
    queryKey: ["journal-entries"],
    queryFn: () => api.get<any>("/accounting/journal-entries"),
  });

  const { data: accountsData } = useQuery({
    queryKey: ["accounts"],
    queryFn: () => api.get<any>("/accounting/accounts"),
    enabled: dialogOpen,
  });

  const entries = data?.data ?? [];
  const accounts = accountsData?.data ?? [];

  function addLineItem() {
    setForm({
      ...form,
      lineItems: [
        ...form.lineItems,
        { accountId: "", description: "", debit: 0, credit: 0 },
      ],
    });
  }

  function removeLineItem(index: number) {
    setForm({
      ...form,
      lineItems: form.lineItems.filter((_, i) => i !== index),
    });
  }

  function updateLineItem(index: number, field: keyof LineItem, value: any) {
    const items = [...form.lineItems];
    items[index] = { ...items[index], [field]: value };
    setForm({ ...form, lineItems: items });
  }

  const createMutation = useMutation({
    mutationFn: (payload: any) => api.post("/accounting/journal-entries", payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      setDialogOpen(false);
      setForm({ date: new Date().toISOString().split("T")[0], description: "", reference: "", lineItems: [] });
      toast({ title: "Journal entry created", description: "The entry has been created successfully." });
    },
    onError: (err: Error) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/accounting/journal-entries/${id}`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["journal-entries"] }); toast({ title: "Journal entry deleted" }); },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const columns = useMemo(
    () => [
      { accessorKey: "entryNumber", header: "Number" },
      {
        accessorKey: "date",
        header: "Date",
        cell: ({ getValue }: any) => new Date(getValue()).toLocaleDateString(),
      },
      { accessorKey: "description", header: "Description" },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ getValue }: any) => {
          const status = getValue() as string;
          const variant = status === "POSTED" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700";
          return <Badge className={variant}>{status}</Badge>;
        },
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }: any) => (
          <button onClick={(e) => { e.stopPropagation(); if (confirm("Delete this journal entry?")) deleteMutation.mutate(row.original.id); }} className="text-sm text-destructive hover:underline">Delete</button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: entries,
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
          <h1 className="text-2xl font-bold">Journal Entries</h1>
          <p className="text-sm text-muted-foreground">Record and manage journal entries</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Entry</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create Journal Entry</DialogTitle>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createMutation.mutate({
                  ...form,
                  lineItems: form.lineItems.map((li) => ({
                    ...li,
                    debit: +li.debit,
                    credit: +li.credit,
                  })),
                });
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reference">Reference</Label>
                  <Input
                    id="reference"
                    placeholder="e.g. INV-001"
                    value={form.reference}
                    onChange={(e) => setForm({ ...form, reference: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  placeholder="Entry description"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Line Items</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addLineItem}>
                    Add Line
                  </Button>
                </div>
                {form.lineItems.length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">
                    No line items yet. Click "Add Line" to add one.
                  </p>
                )}
                {form.lineItems.map((item, i) => (
                  <div key={i} className="grid grid-cols-12 gap-2 items-end rounded-lg border p-3">
                    <div className="col-span-4 space-y-1">
                      <Label className="text-xs">Account</Label>
                      <Select
                        value={item.accountId}
                        onValueChange={(v) => updateLineItem(i, "accountId", v)}
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Select" />
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
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Debit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-8 text-xs"
                        value={item.debit || ""}
                        onChange={(e) => updateLineItem(i, "debit", +e.target.value)}
                      />
                    </div>
                    <div className="col-span-3 space-y-1">
                      <Label className="text-xs">Credit</Label>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        className="h-8 text-xs"
                        value={item.credit || ""}
                        onChange={(e) => updateLineItem(i, "credit", +e.target.value)}
                      />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <Label className="text-xs">Desc</Label>
                      <Input
                        placeholder="desc"
                        className="h-8 text-xs"
                        value={item.description}
                        onChange={(e) => updateLineItem(i, "description", e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeLineItem(i)}
                      className="col-span-12 text-xs text-destructive hover:underline text-right"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-3">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createMutation.isPending || form.lineItems.length === 0}>
                  {createMutation.isPending ? "Creating..." : "Create Entry"}
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
              <TableRow
                key={row.id}
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => {
                  setSelectedEntry(row.original);
                  setViewDialogOpen(true);
                }}
              >
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

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Entry #{selectedEntry?.entryNumber}</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Date:</span>{" "}
                  {new Date(selectedEntry.date).toLocaleDateString()}
                </div>
                <div>
                  <span className="text-muted-foreground">Reference:</span>{" "}
                  {selectedEntry.reference || "-"}
                </div>
                <div>
                  <span className="text-muted-foreground">Status:</span>{" "}
                  <Badge
                    className={
                      selectedEntry.status === "POSTED"
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }
                  >
                    {selectedEntry.status}
                  </Badge>
                </div>
              </div>
              <div className="text-sm">
                <span className="text-muted-foreground">Description:</span>{" "}
                {selectedEntry.description}
              </div>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Account</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Debit</TableHead>
                    <TableHead className="text-right">Credit</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedEntry.lineItems?.map((li: any, i: number) => (
                    <TableRow key={li.id ?? i}>
                      <TableCell>
                        {li.account?.code} - {li.account?.name}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {li.description || "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {li.debit ? `$${Number(li.debit).toFixed(2)}` : "-"}
                      </TableCell>
                      <TableCell className="text-right font-mono">
                        {li.credit ? `$${Number(li.credit).toFixed(2)}` : "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

