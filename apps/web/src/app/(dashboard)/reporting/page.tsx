"use client";



export const dynamic = "force-dynamic";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface ReportDef {
  key: string;
  title: string;
  description: string;
  endpoint: string;
  columns: { key: string; label: string; format?: "currency" | "number" }[];
}

const REPORTS: ReportDef[] = [
  {
    key: "sales-summary",
    title: "Sales Summary",
    description: "Total sales, orders, and invoices by period",
    endpoint: "/reports/sales-summary",
    columns: [
      { key: "period", label: "Period" },
      { key: "totalSales", label: "Total Sales", format: "currency" },
      { key: "orderCount", label: "Orders", format: "number" },
      { key: "invoiceCount", label: "Invoices", format: "number" },
    ],
  },
  {
    key: "purchase-summary",
    title: "Purchase Summary",
    description: "Total purchases and purchase orders by period",
    endpoint: "/reports/purchase-summary",
    columns: [
      { key: "period", label: "Period" },
      { key: "totalPurchases", label: "Total Purchases", format: "currency" },
      { key: "poCount", label: "Purchase Orders", format: "number" },
    ],
  },
  {
    key: "inventory-valuation",
    title: "Inventory Valuation",
    description: "Stock value by warehouse",
    endpoint: "/reports/inventory-valuation",
    columns: [
      { key: "warehouse", label: "Warehouse" },
      { key: "totalItems", label: "Total Items", format: "number" },
      { key: "totalValue", label: "Total Value", format: "currency" },
    ],
  },
  {
    key: "customer-analysis",
    title: "Customer Analysis",
    description: "Top customers by revenue",
    endpoint: "/reports/customer-analysis",
    columns: [
      { key: "customer", label: "Customer" },
      { key: "totalOrders", label: "Orders", format: "number" },
      { key: "totalRevenue", label: "Revenue", format: "currency" },
    ],
  },
  {
    key: "employee-summary",
    title: "Employee Summary",
    description: "Headcount by department",
    endpoint: "/reports/employee-summary",
    columns: [
      { key: "department", label: "Department" },
      { key: "headcount", label: "Headcount", format: "number" },
    ],
  },
  {
    key: "financial-summary",
    title: "Financial Summary",
    description: "Revenue vs expense overview",
    endpoint: "/reports/financial-summary",
    columns: [
      { key: "period", label: "Period" },
      { key: "revenue", label: "Revenue", format: "currency" },
      { key: "expenses", label: "Expenses", format: "currency" },
      { key: "net", label: "Net", format: "currency" },
    ],
  },
];

function ReportDialog({
  report,
  open,
  onOpenChange,
}: {
  report: ReportDef | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { data, isLoading } = useQuery({
    queryKey: [report?.key],
    queryFn: () => api.get<any>(report!.endpoint),
    enabled: !!report && open,
  });

  const rows: any[] = data?.data ?? [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{report?.title}</DialogTitle>
          <DialogDescription>{report?.description}</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="h-32 animate-pulse rounded-lg bg-muted" />
        ) : rows.length === 0 ? (
          <p className="py-4 text-center text-sm text-muted-foreground">
            No data available.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                {report?.columns.map((col) => (
                  <TableHead key={col.key}>{col.label}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow key={i}>
                  {report?.columns.map((col) => (
                    <TableCell key={col.key}>
                      {col.format === "currency"
                        ? `$${Number(row[col.key]).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                        : col.format === "number"
                          ? Number(row[col.key]).toLocaleString()
                          : row[col.key] ?? "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function ReportingPage() {
  const [selectedReport, setSelectedReport] = useState<ReportDef | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Reporting Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Generate and view business reports
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REPORTS.map((report) => (
          <Card key={report.key}>
            <CardHeader>
              <CardTitle className="text-lg">{report.title}</CardTitle>
              <CardDescription>{report.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => setSelectedReport(report)}
              >
                Generate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <ReportDialog
        report={selectedReport}
        open={!!selectedReport}
        onOpenChange={(open) => {
          if (!open) setSelectedReport(null);
        }}
      />
    </div>
  );
}

