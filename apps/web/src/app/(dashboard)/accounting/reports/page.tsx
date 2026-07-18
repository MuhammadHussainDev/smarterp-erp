"use client";



export const dynamic = "force-dynamic";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function LoadingSkeleton() {
  return <div className="h-48 animate-pulse rounded-lg bg-muted" />;
}

function BalanceSheet() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "balance-sheet"],
    queryFn: () => api.get<any>("/accounting/reports/balance-sheet"),
  });

  if (isLoading) return <LoadingSkeleton />;

  const groups = data?.data ?? [];

  return (
    <div className="space-y-6">
      {groups.map((group: any) => (
        <Card key={group.type}>
          <CardHeader>
            <CardTitle className="text-lg">{group.type}</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Account</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="text-right">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.accounts?.map((acct: any) => (
                  <TableRow key={acct.id}>
                    <TableCell className="font-medium">{acct.name}</TableCell>
                    <TableCell className="font-mono text-muted-foreground">{acct.code}</TableCell>
                    <TableCell className="text-right font-mono">
                      ${Number(acct.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={2} className="font-bold text-right">
                    Total {group.type}
                  </TableCell>
                  <TableCell className="text-right font-bold font-mono">
                    ${Number(group.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function IncomeStatement() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "income-statement"],
    queryFn: () => api.get<any>("/accounting/reports/income-statement"),
  });

  if (isLoading) return <LoadingSkeleton />;

  const report = data?.data;
  if (!report) return <p className="text-sm text-muted-foreground">No data available.</p>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income Statement</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Revenue</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.revenue?.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total Revenue</TableCell>
                <TableCell className="text-right font-bold font-mono">
                  ${Number(report.revenue?.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div>
          <h3 className="mb-2 text-sm font-semibold text-muted-foreground">Expenses</h3>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Account</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {report.expenses?.items?.map((item: any) => (
                <TableRow key={item.id}>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="text-right font-mono">
                    ${Number(item.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell className="font-bold">Total Expenses</TableCell>
                <TableCell className="text-right font-bold font-mono">
                  ${Number(report.expenses?.total).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <div className="rounded-lg border bg-muted/50 p-4">
          <div className="flex items-center justify-between text-lg font-bold">
            <span>Net Income</span>
            <span
              className={`font-mono ${Number(report.netIncome) >= 0 ? "text-green-600" : "text-red-600"}`}
            >
              ${Number(report.netIncome).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TrialBalance() {
  const { data, isLoading } = useQuery({
    queryKey: ["reports", "trial-balance"],
    queryFn: () => api.get<any>("/accounting/reports/trial-balance"),
  });

  if (isLoading) return <LoadingSkeleton />;

  const items = data?.data ?? [];

  const totalDebits = items.reduce(
    (sum: number, i: any) => sum + Number(i.debit ?? 0),
    0,
  );
  const totalCredits = items.reduce(
    (sum: number, i: any) => sum + Number(i.credit ?? 0),
    0,
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Trial Balance</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Account</TableHead>
              <TableHead>Code</TableHead>
              <TableHead className="text-right">Debit</TableHead>
              <TableHead className="text-right">Credit</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item: any) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                <TableCell className="font-mono text-muted-foreground">{item.code}</TableCell>
                <TableCell className="text-right font-mono">
                  {item.debit
                    ? `$${Number(item.debit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : "-"}
                </TableCell>
                <TableCell className="text-right font-mono">
                  {item.credit
                    ? `$${Number(item.credit).toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                    : "-"}
                </TableCell>
              </TableRow>
            ))}
            <TableRow>
              <TableCell colSpan={2} className="font-bold text-right">
                Totals
              </TableCell>
              <TableCell className="text-right font-bold font-mono">
                ${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
              <TableCell className="text-right font-bold font-mono">
                ${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
        {Math.abs(totalDebits - totalCredits) > 0.01 && (
          <div className="mt-4">
            <Badge variant="destructive" className="text-xs">
              Trial balance out of balance by $
              {Math.abs(totalDebits - totalCredits).toFixed(2)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Financial Reports</h1>
        <p className="text-sm text-muted-foreground">
          View balance sheet, income statement, and trial balance
        </p>
      </div>

      <Tabs defaultValue="balance-sheet">
        <TabsList>
          <TabsTrigger value="balance-sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="income-statement">Income Statement</TabsTrigger>
          <TabsTrigger value="trial-balance">Trial Balance</TabsTrigger>
        </TabsList>
        <TabsContent value="balance-sheet" className="mt-6">
          <BalanceSheet />
        </TabsContent>
        <TabsContent value="income-statement" className="mt-6">
          <IncomeStatement />
        </TabsContent>
        <TabsContent value="trial-balance" className="mt-6">
          <TrialBalance />
        </TabsContent>
      </Tabs>
    </div>
  );
}

