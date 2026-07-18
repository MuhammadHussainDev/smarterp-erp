"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface NavGroup {
  label: string;
  items: { href: string; label: string }[];
}

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [{ href: "/", label: "Dashboard" }],
  },
  {
    label: "CRM",
    items: [
      { href: "/crm/customers", label: "Customers" },
      { href: "/crm/leads", label: "Leads" },
      { href: "/crm/opportunities", label: "Opportunities" },
    ],
  },
  {
    label: "Sales",
    items: [
      { href: "/sales/quotations", label: "Quotations" },
      { href: "/sales/orders", label: "Orders" },
      { href: "/sales/invoices", label: "Invoices" },
    ],
  },
  {
    label: "Purchasing",
    items: [
      { href: "/purchasing/suppliers", label: "Suppliers" },
      { href: "/purchasing/orders", label: "Purchase Orders" },
      { href: "/purchasing/requests", label: "Purchase Requests" },
    ],
  },
  {
    label: "Inventory",
    items: [
      { href: "/inventory/products", label: "Products" },
      { href: "/inventory/categories", label: "Categories" },
      { href: "/inventory/brands", label: "Brands" },
      { href: "/inventory/units", label: "Units" },
    ],
  },
  {
    label: "Warehouse",
    items: [
      { href: "/warehouse/stores", label: "Warehouses" },
      { href: "/warehouse/stock", label: "Stock Levels" },
      { href: "/warehouse/transfers", label: "Stock Transfers" },
    ],
  },
  {
    label: "Accounting",
    items: [
      { href: "/accounting/accounts", label: "Chart of Accounts" },
      { href: "/accounting/journal", label: "Journal Entries" },
      { href: "/accounting/budgets", label: "Budgets" },
      { href: "/accounting/reports", label: "Reports" },
    ],
  },
  {
    label: "HR",
    items: [
      { href: "/hr/employees", label: "Employees" },
      { href: "/hr/attendance", label: "Attendance" },
      { href: "/hr/leave", label: "Leave" },
      { href: "/hr/recruitment", label: "Recruitment" },
    ],
  },
  {
    label: "Payroll",
    items: [
      { href: "/payroll/payroll", label: "Payroll" },
      { href: "/payroll/benefits", label: "Benefits" },
      { href: "/payroll/reviews", label: "Performance" },
      { href: "/payroll/training", label: "Training" },
    ],
  },
  {
    label: "AI",
    items: [
      { href: "/ai", label: "AI Assistant" },
    ],
  },
  {
    label: "System",
    items: [
      { href: "/notifications", label: "Notifications" },
      { href: "/audit", label: "Audit Log" },
      { href: "/reporting", label: "Reporting" },
    ],
  },
  {
    label: "Settings",
    items: [
      { href: "/settings/company", label: "Company" },
      { href: "/settings/branches", label: "Branches" },
      { href: "/settings/departments", label: "Departments" },
      { href: "/settings/users", label: "Users" },
      { href: "/settings/roles", label: "Roles" },
      { href: "/settings/localization", label: "Localization" },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r bg-background overflow-y-auto">
      <div className="flex h-16 items-center border-b px-6">
        <Link href="/dashboard" className="text-xl font-bold">
          SmartERP AI
        </Link>
      </div>
      <nav className="space-y-6 p-4">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="mb-2 px-3 text-xs font-semibold uppercase text-muted-foreground">
              {group.label}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    (pathname ?? "") === item.href || (pathname ?? "").startsWith(item.href + "/")
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </nav>
    </aside>
  );
}
