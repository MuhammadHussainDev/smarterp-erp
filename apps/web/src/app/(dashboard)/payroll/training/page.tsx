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
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type TrainingProgram = {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  status: string;
};

type Enrollment = {
  id: string;
  employeeName: string;
  programTitle: string;
  status: string;
};

const programStatusColors: Record<string, string> = {
  PLANNED: "border-blue-200 bg-blue-100 text-blue-700",
  IN_PROGRESS: "border-yellow-200 bg-yellow-100 text-yellow-700",
  COMPLETED: "border-green-200 bg-green-100 text-green-700",
};

const enrollmentStatusColors: Record<string, string> = {
  ENROLLED: "border-blue-200 bg-blue-100 text-blue-700",
  COMPLETED: "border-green-200 bg-green-100 text-green-700",
};

export default function TrainingPage() {
  const queryClient = useQueryClient();

  const [showProgramForm, setShowProgramForm] = useState(false);
  const [programForm, setProgramForm] = useState({
    title: "",
    description: "",
    startDate: "",
    endDate: "",
    status: "PLANNED",
  });

  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [enrollForm, setEnrollForm] = useState({ employeeId: "", trainingId: "" });

  const { data: programsData, isLoading: programsLoading } = useQuery({
    queryKey: ["training-programs"],
    queryFn: () => api.get<any>("/payroll/training"),
  });

  const { data: enrollmentsData, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["training-enrollments"],
    queryFn: () => api.get<any>("/payroll/training/enrollments"),
  });

  const { data: employeesData } = useQuery({
    queryKey: ["employees"],
    queryFn: () => api.get<any>("/employees"),
  });

  const createProgramMutation = useMutation({
    mutationFn: (data: any) => api.post("/payroll/training", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-programs"] });
      setShowProgramForm(false);
      setProgramForm({ title: "", description: "", startDate: "", endDate: "", status: "PLANNED" });
    },
  });

  const enrollMutation = useMutation({
    mutationFn: (data: any) => api.post("/payroll/training/enroll", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["training-enrollments"] });
      setShowEnrollForm(false);
      setEnrollForm({ employeeId: "", trainingId: "" });
    },
  });

  const completeMutation = useMutation({
    mutationFn: (id: string) => api.patch(`/employee-training/${id}/complete`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["training-enrollments"] }),
  });

  const programs: TrainingProgram[] = useMemo(() => programsData?.data || [], [programsData]);
  const enrollments: Enrollment[] = useMemo(() => enrollmentsData?.data || [], [enrollmentsData]);
  const employees: any[] = useMemo(() => employeesData?.data || employeesData || [], [employeesData]);

  const programColumnHelper = createColumnHelper<TrainingProgram>();

  const programColumns = useMemo(
    () => [
      programColumnHelper.accessor("title", {
        header: "Title",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      programColumnHelper.accessor("startDate", {
        header: "Start Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      programColumnHelper.accessor("endDate", {
        header: "End Date",
        cell: (info) => new Date(info.getValue()).toLocaleDateString(),
      }),
      programColumnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge className={programStatusColors[info.getValue()] || ""} variant="outline">
            {info.getValue()}
          </Badge>
        ),
      }),
    ],
    []
  );

  const programTable = useReactTable({
    data: programs,
    columns: programColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const enrollmentColumnHelper = createColumnHelper<Enrollment>();

  const enrollmentColumns = useMemo(
    () => [
      enrollmentColumnHelper.accessor("employeeName", {
        header: "Employee",
        cell: (info) => <span className="font-medium">{info.getValue()}</span>,
      }),
      enrollmentColumnHelper.accessor("programTitle", {
        header: "Program",
      }),
      enrollmentColumnHelper.accessor("status", {
        header: "Status",
        cell: (info) => (
          <Badge className={enrollmentStatusColors[info.getValue()] || ""} variant="outline">
            {info.getValue()}
          </Badge>
        ),
      }),
      enrollmentColumnHelper.display({
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          row.original.status === "ENROLLED" ? (
            <Button
              size="sm"
              variant="outline"
              onClick={() => completeMutation.mutate(row.original.id)}
              disabled={completeMutation.isPending}
            >
              Mark Complete
            </Button>
          ) : null
        ),
      }),
    ],
    [completeMutation]
  );

  const enrollmentTable = useReactTable({
    data: enrollments,
    columns: enrollmentColumns,
    getCoreRowModel: getCoreRowModel(),
  });

  const isLoading = programsLoading || enrollmentsLoading;

  if (isLoading) return <div className="h-32 animate-pulse rounded-lg bg-muted" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Training</h1>
        <p className="text-sm text-muted-foreground">Manage training programs and enrollments</p>
      </div>

      <Dialog open={showProgramForm} onOpenChange={setShowProgramForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Program</DialogTitle>
            <DialogDescription>Create a new training program.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <input
                value={programForm.title}
                onChange={(e) => setProgramForm({ ...programForm, title: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                value={programForm.description}
                onChange={(e) => setProgramForm({ ...programForm, description: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Start Date</label>
                <input
                  type="date"
                  value={programForm.startDate}
                  onChange={(e) => setProgramForm({ ...programForm, startDate: e.target.value })}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">End Date</label>
                <input
                  type="date"
                  value={programForm.endDate}
                  onChange={(e) => setProgramForm({ ...programForm, endDate: e.target.value })}
                  className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  required
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Status</label>
              <select
                value={programForm.status}
                onChange={(e) => setProgramForm({ ...programForm, status: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="PLANNED">PLANNED</option>
                <option value="IN_PROGRESS">IN_PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProgramForm(false)}>Cancel</Button>
            <Button
              onClick={() =>
                createProgramMutation.mutate({
                  title: programForm.title,
                  description: programForm.description,
                  startDate: programForm.startDate,
                  endDate: programForm.endDate,
                  status: programForm.status,
                })
              }
              disabled={!programForm.title || !programForm.startDate || !programForm.endDate || createProgramMutation.isPending}
            >
              {createProgramMutation.isPending ? "Creating..." : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showEnrollForm} onOpenChange={setShowEnrollForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enroll Employee</DialogTitle>
            <DialogDescription>Enroll an employee in a training program.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Employee</label>
              <select
                value={enrollForm.employeeId}
                onChange={(e) => setEnrollForm({ ...enrollForm, employeeId: e.target.value })}
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
              <label className="block text-sm font-medium mb-1">Training Program</label>
              <select
                value={enrollForm.trainingId}
                onChange={(e) => setEnrollForm({ ...enrollForm, trainingId: e.target.value })}
                className="block w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                required
              >
                <option value="">Select program</option>
                {programs.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEnrollForm(false)}>Cancel</Button>
            <Button
              onClick={() => enrollMutation.mutate(enrollForm)}
              disabled={!enrollForm.employeeId || !enrollForm.trainingId || enrollMutation.isPending}
            >
              {enrollMutation.isPending ? "Enrolling..." : "Enroll"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs defaultValue="programs">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="programs">Programs</TabsTrigger>
            <TabsTrigger value="enrollments">Enrollments</TabsTrigger>
          </TabsList>
          <TabsContent value="programs" className="mt-0">
            <Button onClick={() => setShowProgramForm(true)}>New Program</Button>
          </TabsContent>
          <TabsContent value="enrollments" className="mt-0">
            <Button onClick={() => setShowEnrollForm(true)}>Enroll Employee</Button>
          </TabsContent>
        </div>

        <TabsContent value="programs">
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                {programTable.getHeaderGroups().map((hg) => (
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
                {programTable.getRowModel().rows.map((row) => (
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
            {programs.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No programs yet.</div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="enrollments">
          <div className="rounded-lg border bg-card">
            <table className="w-full">
              <thead>
                {enrollmentTable.getHeaderGroups().map((hg) => (
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
                {enrollmentTable.getRowModel().rows.map((row) => (
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
            {enrollments.length === 0 && (
              <div className="p-8 text-center text-sm text-muted-foreground">No enrollments yet.</div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

