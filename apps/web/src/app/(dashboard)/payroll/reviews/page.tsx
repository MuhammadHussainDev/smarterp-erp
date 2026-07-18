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

type Review = {
  id: string;
  employeeName: string;
  reviewerName: string;
  reviewDate: string;
  rating: number;
  comments?: string;
};

export default function ReviewsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employeeId: "",
    reviewerId: "",
    reviewDate: "",
    rating: "",
    comments: "",
  });

  const { data, isLoading } = useQuery({
    queryKey: ["reviews"],
    queryFn: () => api.get<any>("/payroll/reviews"),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get<any>("/employees"),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/payroll/reviews", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setShowForm(false);
      setForm({ employeeId: "", reviewerId: "", reviewDate: "", rating: "", comments: "" });
    },
  });

  const reviews: Review[] = useMemo(() => data?.data || [], [data]);
  const employees: any[] = useMemo(() => employeesData?.data || employeesData || [], [employeesData]);

  const columnHelper = createColumnHelper<Review>();

  const columns = useMemo(
    () => [
      columnHelper.accessor("employeeName", {
        header: "Employee",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      columnHelper.accessor("reviewerName", {
        header: "Reviewer",
      }),
      columnHelper.accessor("reviewDate", {
        header: "Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      columnHelper.accessor("rating", {
        header: "Rating",
        cell: (info) => (
          <span className="flex">
            {Array.from({ length: 10 }, (_, i) => (
              <span key={i} className={i < info.getValue() ? "text-yellow-400" : "text-gray-200"}>
                &#9733;
              </span>
            ))}
          </span>
        ),
      }),
      columnHelper.accessor("comments", {
        header: "Comments",
        cell: (info) => info.getValue() || "-",
      }),
    ],
    []
  );

  const table = useReactTable({
    data: reviews,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Performance Reviews</h1>
          <p className="text-sm text-muted-foreground">Manage employee performance evaluations</p>
        </div>
        <Button onClick={() => setShowForm(true)}>New Review</Button>
      </div>

      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Performance Review</DialogTitle>
            <DialogDescription>Create a new performance review record.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee</label>
              <select
                value={form.employeeId}
                onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
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
              <label className="block text-sm font-medium mb-1">Reviewer</label>
              <select
                value={form.reviewerId}
                onChange={(e) => setForm({ ...form, reviewerId: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select reviewer</option>
                {(employees || []).map((emp: any) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Review Date</label>
              <input
                type="date"
                value={form.reviewDate}
                onChange={(e) => setForm({ ...form, reviewDate: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Rating (1-10)</label>
              <input
                type="number"
                min={1}
                max={10}
                value={form.rating}
                onChange={(e) => setForm({ ...form, rating: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Comments</label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button
              onClick={() =>
                createMutation.mutate({
                  employeeId: form.employeeId,
                  reviewerId: form.reviewerId,
                  reviewDate: form.reviewDate,
                  rating: +form.rating,
                  comments: form.comments,
                })
              }
              disabled={!form.employeeId || !form.reviewerId || !form.reviewDate || !form.rating || createMutation.isPending}
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
        {reviews.length === 0 && (
          <div className="p-8 text-center text-sm text-muted-foreground">No reviews yet.</div>
        )}
      </div>
    </div>
  );
}

