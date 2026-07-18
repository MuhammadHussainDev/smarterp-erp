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

type Position = {
  id: string;
  position: string;
  department: string;
  description: string;
  requirements: string;
  status: "OPEN" | "IN_PROGRESS" | "CLOSED";
  createdAt: string;
};

const statusVariant: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  OPEN: "default",
  IN_PROGRESS: "secondary",
  CLOSED: "outline",
};

export default function RecruitmentPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({
    position: "",
    department: "",
    description: "",
    requirements: "",
    status: "OPEN" as string,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["hr", "recruitment"],
    queryFn: () => api.get<any>("/hr/recruitment"),
  });

  const mutation = useMutation({
    mutationFn: (data: any) => api.post("/hr/recruitment", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hr", "recruitment"] });
      setDialogOpen(false);
      toast({ title: "Position created successfully" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const columnHelper = createColumnHelper<Position>();
  const columns = useMemo(
    () => [
      columnHelper.accessor("position", { header: "Position", enableSorting: true }),
      columnHelper.accessor("department", { header: "Department", enableSorting: true }),
      columnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge variant={statusVariant[info.getValue()] || "outline"}>
            {info.getValue() === "IN_PROGRESS" ? "In Progress" : info.getValue()}
          </Badge>
        ),
      }),
      columnHelper.accessor("createdAt", {
        header: "Created At",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
        enableSorting: true,
      }),
    ],
    [],
  );

  const positions = useMemo(() => data?.data || [], [data]);

  const table = useReactTable({
    data: positions,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    initialState: { sorting: [{ id: "createdAt", desc: true }] },
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
          <h1 className="text-2xl font-bold">Recruitment</h1>
          <p className="text-sm text-muted-foreground">Manage open positions and hiring pipeline</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>New Position</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>New Position</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
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
                  <label className="text-sm font-medium">Department</label>
                  <input
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Requirements</label>
                <textarea
                  value={form.requirements}
                  onChange={(e) => setForm({ ...form, requirements: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
              <Button type="submit" disabled={mutation.isPending} className="w-full">
                {mutation.isPending ? "Creating..." : "Create Position"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
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

