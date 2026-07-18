import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class AiService {
  private positiveWords = [
    "good", "great", "excellent", "amazing", "wonderful", "fantastic",
    "outstanding", "superb", "brilliant", "love", "perfect", "happy",
    "satisfied", "impressed", "delighted", "helpful", "efficient",
    "reliable", "fast", "quality", "recommend", "thankful", "best",
  ];

  private negativeWords = [
    "bad", "terrible", "awful", "horrible", "poor", "worst",
    "hate", "disappointed", "frustrated", "slow", "useless",
    "broken", "damaged", "error", "failure", "complaint",
    "unhappy", "unsatisfied", "rude", "unhelpful", "expensive",
    "late", "defective", "problem", "issue",
  ];

  constructor(private prisma: PrismaService) {}

  async chat(tenantId: string, message: string) {
    const lower = message.toLowerCase();

    if (lower.includes("sales") || lower.includes("revenue") || lower.includes("orders") || lower.includes("order")) {
      return this.handleSalesQuery(tenantId);
    }

    if (lower.includes("inventory") || lower.includes("stock") || lower.includes("products") || lower.includes("product")) {
      return this.handleInventoryQuery(tenantId);
    }

    if (lower.includes("customer") || lower.includes("customers") || lower.includes("clients") || lower.includes("client")) {
      return this.handleCustomerQuery(tenantId);
    }

    if (lower.includes("employee") || lower.includes("employees") || lower.includes("staff")) {
      return this.handleEmployeeQuery(tenantId);
    }

    if (lower.includes("invoice") || lower.includes("invoices") || lower.includes("payment") || lower.includes("payments")) {
      return this.handleInvoiceQuery(tenantId);
    }

    return {
      reply:
        "I'm your ERP AI assistant. I can help you with questions about:\n" +
        "- Sales & Revenue (sales stats, top products, recent orders)\n" +
        "- Inventory & Stock (low stock alerts, product counts, stock value)\n" +
        "- Customers (total customers, recent clients)\n" +
        "- Employees (staff count, department info)\n" +
        "- Invoices & Payments (pending invoices, payment stats)\n\n" +
        "Try asking something like 'How are my sales doing?' or 'Show me low stock items'.",
      suggestions: [
        "How are my sales doing?",
        "Show me low stock items",
        "How many customers do I have?",
        "List my employees",
        "Any pending invoices?",
      ],
    };
  }

  async getPredictions(tenantId: string) {
    const now = new Date();
    const oneMonthAgo = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
    const twoMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 2, now.getDate());

    const [recentSales, olderSales, products, lowStockProducts, pendingInvoices] = await Promise.all([
      this.prisma.salesOrder.aggregate({
        where: { tenantId, createdAt: { gte: oneMonthAgo } },
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.salesOrder.aggregate({
        where: { tenantId, createdAt: { gte: twoMonthsAgo, lt: oneMonthAgo } },
        _sum: { grandTotal: true },
      }),
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.product.findMany({
        where: { tenantId, isActive: true },
        include: {
          stock: { select: { quantity: true } },
        },
      }),
      this.prisma.invoice.findMany({
        where: { tenantId, status: { in: ["SENT", "OVERDUE"] }, dueDate: { not: null } },
        select: { number: true, grandTotal: true, dueDate: true, status: true },
        orderBy: { dueDate: "asc" },
      }),
    ]);

    const recentTotal = recentSales._sum.grandTotal || 0;
    const olderTotal = olderSales._sum.grandTotal || 0;

    const lowStockAlerts = lowStockProducts
      .filter((p) => {
        const totalQty = p.stock.reduce((sum, s) => sum + s.quantity, 0);
        return totalQty <= p.minStockLevel;
      })
      .map((p) => {
        const totalQty = p.stock.reduce((sum, s) => sum + s.quantity, 0);
        return {
          productId: p.id,
          productName: p.name,
          currentStock: totalQty,
          minStockLevel: p.minStockLevel,
          sku: p.sku,
        };
      });

    const growthRate = olderTotal > 0 ? (recentTotal - olderTotal) / olderTotal : 0;
    const salesForecast = {
      averageMonthlySales: recentTotal,
      predictedNextMonth: recentTotal * (1 + growthRate),
      growthRate: Math.round(growthRate * 100),
      totalOrdersLastMonth: recentSales._count,
    };

    const upcomingPayments = pendingInvoices.map((inv) => ({
      invoiceNumber: inv.number,
      amount: inv.grandTotal,
      dueDate: inv.dueDate,
      status: inv.status,
    }));

    return { salesForecast, lowStockAlerts, upcomingPayments };
  }

  async getSuggestions(tenantId: string, context: string) {
    const lower = context.toLowerCase();
    const suggestions: string[] = [];

    if (lower.includes("product")) {
      const categories = await this.prisma.category.findMany({
        where: { tenantId },
        select: { name: true },
      });
      suggestions.push(
        `Available categories: ${categories.map((c) => c.name).join(", ") || "none defined"}`,
      );
      suggestions.push(
        "Use descriptive product names with brand, model, and key attributes",
      );
      suggestions.push(
        "Set minStockLevel to 10-20% of average monthly sales for optimal reordering",
      );
    }

    if (lower.includes("customer")) {
      suggestions.push(
        "Segment customers by total spend: VIP (>$10k), Regular ($1k-$10k), Occasional (<$1k)",
      );
      suggestions.push(
        "Tag customers by industry for targeted marketing campaigns",
      );
      suggestions.push(
        "Track customer lifetime value to focus retention efforts on high-value clients",
      );
    }

    if (lower.includes("price")) {
      const products = await this.prisma.product.findMany({
        where: { tenantId, isActive: true },
        select: { costPrice: true, sellingPrice: true, name: true },
        take: 10,
        orderBy: { createdAt: "desc" },
      });

      if (products.length > 0) {
        suggestions.push(
          "Current average margin: " +
            Math.round(
              products.reduce((sum, p) => {
                return p.costPrice > 0
                  ? sum + ((p.sellingPrice - p.costPrice) / p.costPrice) * 100
                  : sum;
              }, 0) / products.length,
            ) + "%",
        );
      }
      suggestions.push(
        "Consider cost-plus pricing: costPrice × (1 + desiredMargin/100)",
      );
      suggestions.push(
        "Review competitor pricing in your market segment quarterly",
      );
    }

    if (suggestions.length === 0) {
      suggestions.push(
        "Context not recognized. Try: product, customer, or price",
      );
    }

    return { suggestions };
  }

  analyzeSentiment(_tenantId: string, text: string) {
    const lower = text.toLowerCase();
    const words = lower.split(/\s+/);

    let positiveScore = 0;
    let negativeScore = 0;

    for (const word of words) {
      if (this.positiveWords.includes(word)) positiveScore++;
      if (this.negativeWords.includes(word)) negativeScore++;
    }

    const total = positiveScore + negativeScore;
    let sentiment: string;
    let score: number;

    if (total === 0) {
      sentiment = "neutral";
      score = 0;
    } else {
      score = Math.round(((positiveScore - negativeScore) / total) * 100);
      if (score > 20) sentiment = "positive";
      else if (score < -20) sentiment = "negative";
      else sentiment = "neutral";
    }

    return {
      sentiment,
      score,
      positiveWords: positiveScore,
      negativeWords: negativeScore,
    };
  }

  private async handleSalesQuery(tenantId: string) {
    const [
      totalSales,
      recentOrders,
      topProducts,
      totalCustomers,
    ] = await Promise.all([
      this.prisma.salesOrder.aggregate({
        where: { tenantId },
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.salesOrder.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { number: true, grandTotal: true, status: true, createdAt: true },
      }),
      this.prisma.salesOrderItem.groupBy({
        by: ["description"],
        where: { salesOrder: { tenantId } },
        _sum: { quantity: true, total: true },
        orderBy: { _sum: { total: "desc" } },
        take: 5,
      }),
      this.prisma.customer.count({ where: { tenantId } }),
    ]);

    const topProductsList = topProducts.map((p) => ({
      name: p.description,
      totalSold: p._sum.quantity || 0,
      revenue: p._sum.total || 0,
    }));

    return {
      reply:
        `📊 Sales Overview:\n` +
        `Total Revenue: $${(totalSales._sum.grandTotal || 0).toFixed(2)}\n` +
        `Total Orders: ${totalSales._count}\n` +
        `Active Customers: ${totalCustomers}\n\n` +
        `Recent Orders:\n${recentOrders
          .map(
            (o) =>
              `  • #${o.number} - $${o.grandTotal.toFixed(2)} (${o.status}) - ${o.createdAt.toLocaleDateString()}`,
          )
          .join("\n")}\n\n` +
        `Top Products:\n${topProductsList
          .map((p) => `  • ${p.name} - ${p.totalSold} units - $${p.revenue.toFixed(2)}`)
          .join("\n")}`,
      data: {
        totalRevenue: totalSales._sum.grandTotal || 0,
        totalOrders: totalSales._count,
        totalCustomers,
        recentOrders,
        topProducts: topProductsList,
      },
      suggestions: [
        "Which products have the highest profit margin?",
        "Show me orders from last month",
        "Compare sales between periods",
      ],
    };
  }

  private async handleInventoryQuery(tenantId: string) {
    const [totalProducts, lowStockItems, totalStockValue] = await Promise.all([
      this.prisma.product.count({ where: { tenantId, isActive: true } }),
      this.prisma.product.findMany({
        where: { tenantId, isActive: true },
        include: { stock: { select: { quantity: true } } },
      }),
      this.prisma.stock.aggregate({
        where: { tenantId },
        _sum: { quantity: true },
      }),
    ]);

    const lowStock = lowStockItems
      .filter((p) => {
        const qty = p.stock.reduce((s, st) => s + st.quantity, 0);
        return qty <= p.minStockLevel;
      })
      .map((p) => ({
        name: p.name,
        sku: p.sku,
        currentStock: p.stock.reduce((s, st) => s + st.quantity, 0),
        minLevel: p.minStockLevel,
      }));

    const totalQty = totalStockValue._sum.quantity || 0;

    return {
      reply:
        `📦 Inventory Overview:\n` +
        `Total Active Products: ${totalProducts}\n` +
        `Total Stock Units: ${totalQty}\n\n` +
        `Low Stock Alerts (${lowStock.length} items):\n${lowStock
          .map(
            (p) =>
              `  • ${p.name} (${p.sku}) - ${p.currentStock} units (min: ${p.minLevel})`,
          )
          .join("\n") || "  None - all products well stocked"}`,
      data: {
        totalProducts,
        totalStockUnits: totalQty,
        lowStockItems: lowStock,
      },
      suggestions: [
        "Show me products by category",
        "Which products need reordering?",
        "View full inventory report",
      ],
    };
  }

  private async handleCustomerQuery(tenantId: string) {
    const [totalCustomers, recentCustomers] = await Promise.all([
      this.prisma.customer.count({ where: { tenantId } }),
      this.prisma.customer.findMany({
        where: { tenantId },
        orderBy: { createdAt: "desc" },
        take: 5,
        select: { name: true, email: true, createdAt: true, status: true },
      }),
    ]);

    return {
      reply:
        `👥 Customer Overview:\n` +
        `Total Customers: ${totalCustomers}\n\n` +
        `Recent Customers:\n${recentCustomers
          .map(
            (c) =>
              `  • ${c.name}${c.email ? ` (${c.email})` : ""} - ${c.createdAt.toLocaleDateString()}`,
          )
          .join("\n")}`,
      data: { totalCustomers, recentCustomers },
      suggestions: [
        "Show top customers by revenue",
        "Which customers have unpaid invoices?",
        "Segment my customers",
      ],
    };
  }

  private async handleEmployeeQuery(tenantId: string) {
    const [totalEmployees, departmentCounts] = await Promise.all([
      this.prisma.employee.count({ where: { tenantId, status: "ACTIVE" } }),
      this.prisma.employee.groupBy({
        by: ["departmentId"],
        where: { tenantId, status: "ACTIVE" },
        _count: true,
      }),
    ]);

    const deptNames = departmentCounts.length > 0
      ? await this.prisma.department.findMany({
          where: {
            tenantId,
            id: { in: departmentCounts.map((d) => d.departmentId).filter((id): id is string => id !== null) },
          },
          select: { id: true, name: true },
        })
      : [];

    const deptMap = new Map(deptNames.map((d) => [d.id, d.name]));
    const deptBreakdown = departmentCounts
      .filter((d) => d.departmentId !== null)
      .map((d) => ({
        department: deptMap.get(d.departmentId as string) || "Unknown",
        count: d._count,
      }));

    return {
      reply:
        `👔 Employee Overview:\n` +
        `Total Active Employees: ${totalEmployees}\n\n` +
        `Department Breakdown:\n${deptBreakdown
          .map((d) => `  • ${d.department}: ${d.count} employees`)
          .join("\n") || "  No department data available"}`,
      data: { totalEmployees, departmentBreakdown: deptBreakdown },
      suggestions: [
        "Show me employees on leave",
        "View payroll summary",
        "List department heads",
      ],
    };
  }

  private async handleInvoiceQuery(tenantId: string) {
    const [
      totalInvoices,
      paidInvoices,
      overdueInvoices,
      totalPayments,
    ] = await Promise.all([
      this.prisma.invoice.aggregate({
        where: { tenantId },
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.invoice.aggregate({
        where: { tenantId, status: "PAID" },
        _sum: { grandTotal: true },
        _count: true,
      }),
      this.prisma.invoice.findMany({
        where: { tenantId, status: "OVERDUE" },
        select: { number: true, grandTotal: true, dueDate: true, customer: { select: { name: true } } },
        orderBy: { dueDate: "asc" },
      }),
      this.prisma.payment.aggregate({
        where: { tenantId },
        _sum: { amount: true },
        _count: true,
      }),
    ]);

    return {
      reply:
        `💰 Invoices & Payments Overview:\n` +
        `Total Invoiced: $${(totalInvoices._sum.grandTotal || 0).toFixed(2)} (${totalInvoices._count} invoices)\n` +
        `Paid: $${(paidInvoices._sum.grandTotal || 0).toFixed(2)} (${paidInvoices._count} invoices)\n` +
        `Total Payments Received: $${(totalPayments._sum.amount || 0).toFixed(2)}\n\n` +
        `Overdue Invoices (${overdueInvoices.length}):\n${overdueInvoices
          .map(
            (inv) =>
              `  • #${inv.number} - $${inv.grandTotal.toFixed(2)} - ${inv.customer.name} (Due: ${inv.dueDate?.toLocaleDateString()})`,
          )
          .join("\n") || "  None"}`,
      data: {
        totalInvoiced: totalInvoices._sum.grandTotal || 0,
        totalInvoices: totalInvoices._count,
        totalPaid: paidInvoices._sum.grandTotal || 0,
        paidInvoices: paidInvoices._count,
        totalPaymentsReceived: totalPayments._sum.amount || 0,
        overdueInvoices,
      },
      suggestions: [
        "Send payment reminders for overdue invoices",
        "Show me this month's payments",
        "Generate invoice aging report",
      ],
    };
  }
}
