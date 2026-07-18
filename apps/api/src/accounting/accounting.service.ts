import { Injectable, NotFoundException, ConflictException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { Prisma } from "@prisma/client";

@Injectable()
export class AccountingService {
  constructor(private prisma: PrismaService) {}

  // ── Chart of Accounts ─────────────────────────────────────────

  async createAccount(tenantId: string, dto: any) {
    const existing = await this.prisma.account.findFirst({
      where: { tenantId, code: dto.code },
    });
    if (existing) throw new ConflictException("Account code already exists");
    return this.prisma.account.create({ data: { ...dto, tenantId } });
  }

  async findAllAccounts(tenantId: string) {
    return this.prisma.account.findMany({
      where: { tenantId },
      include: { _count: { select: { children: true, journalLines: true } } },
      orderBy: { code: "asc" },
    });
  }

  async findOneAccount(tenantId: string, id: string) {
    const account = await this.prisma.account.findFirst({
      where: { id, tenantId },
      include: { parent: true, children: true },
    });
    if (!account) throw new NotFoundException("Account not found");
    return account;
  }

  async updateAccount(tenantId: string, id: string, dto: any) {
    await this.findOneAccount(tenantId, id);
    return this.prisma.account.update({ where: { id }, data: dto });
  }

  async removeAccount(tenantId: string, id: string) {
    await this.findOneAccount(tenantId, id);
    return this.prisma.account.update({ where: { id }, data: { isActive: false } });
  }

  // ── Journal Entries ───────────────────────────────────────────

  async createJournalEntry(tenantId: string, dto: any) {
    const count = await this.prisma.journalEntry.count({ where: { tenantId } });
    const number = `JE-${String(count + 1).padStart(6, "0")}`;

    return this.prisma.journalEntry.create({
      data: {
        tenantId,
        number,
        date: dto.date ? new Date(dto.date) : undefined,
        description: dto.description,
        reference: dto.reference,
        lines: {
          create: dto.lines.map((line: any) => ({
            accountId: line.accountId,
            debit: line.debit,
            credit: line.credit,
            description: line.description,
          })),
        },
      },
      include: { lines: { include: { account: { select: { code: true, name: true } } } } },
    });
  }

  async findAllJournalEntries(tenantId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      this.prisma.journalEntry.findMany({
        where: { tenantId },
        skip,
        take: limit,
        include: { lines: { include: { account: { select: { code: true, name: true } } } } },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.journalEntry.count({ where: { tenantId } }),
    ]);
    return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneJournalEntry(tenantId: string, id: string) {
    const entry = await this.prisma.journalEntry.findFirst({
      where: { id, tenantId },
      include: { lines: { include: { account: { select: { code: true, name: true } } } } },
    });
    if (!entry) throw new NotFoundException("Journal entry not found");
    return entry;
  }

  // ── Budgets ───────────────────────────────────────────────────

  async createBudget(tenantId: string, dto: any) {
    const existing = await this.prisma.budget.findFirst({
      where: { tenantId, fiscalYear: dto.fiscalYear, accountId: dto.accountId },
    });
    if (existing) throw new ConflictException("Budget already exists for this account and fiscal year");
    return this.prisma.budget.create({ data: { ...dto, tenantId } });
  }

  async findAllBudgets(tenantId: string, fiscalYear?: number) {
    const where: any = { tenantId };
    if (fiscalYear) where.fiscalYear = fiscalYear;
    return this.prisma.budget.findMany({
      where,
      include: { account: { select: { code: true, name: true } } },
      orderBy: { fiscalYear: "desc" },
    });
  }

  async findOneBudget(tenantId: string, id: string) {
    const budget = await this.prisma.budget.findFirst({
      where: { id, tenantId },
      include: { account: { select: { code: true, name: true } } },
    });
    if (!budget) throw new NotFoundException("Budget not found");
    return budget;
  }

  async updateBudget(tenantId: string, id: string, dto: any) {
    await this.findOneBudget(tenantId, id);
    return this.prisma.budget.update({ where: { id }, data: dto });
  }

  async removeBudget(tenantId: string, id: string) {
    const budget = await this.findOneBudget(tenantId, id);
    return this.prisma.budget.delete({ where: { id } });
  }

  // ── Tax Rates ─────────────────────────────────────────────────

  async createTaxRate(tenantId: string, dto: any) {
    const existing = await this.prisma.taxRate.findFirst({
      where: { tenantId, name: dto.name },
    });
    if (existing) throw new ConflictException("Tax rate name already exists");
    return this.prisma.taxRate.create({ data: { ...dto, tenantId } });
  }

  async findAllTaxRates(tenantId: string) {
    return this.prisma.taxRate.findMany({
      where: { tenantId },
      orderBy: { name: "asc" },
    });
  }

  async findOneTaxRate(tenantId: string, id: string) {
    const rate = await this.prisma.taxRate.findFirst({
      where: { id, tenantId },
    });
    if (!rate) throw new NotFoundException("Tax rate not found");
    return rate;
  }

  async updateTaxRate(tenantId: string, id: string, dto: any) {
    await this.findOneTaxRate(tenantId, id);
    return this.prisma.taxRate.update({ where: { id }, data: dto });
  }

  async removeTaxRate(tenantId: string, id: string) {
    await this.findOneTaxRate(tenantId, id);
    return this.prisma.taxRate.delete({ where: { id } });
  }

  // ── Reports ──────────────────────────────────────────────────

  async getBalanceSheet(tenantId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { tenantId, isActive: true },
      include: {
        journalLines: true,
      },
    });

    const balances = accounts.map((account) => {
      const totalDebit = account.journalLines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, l) => sum + l.credit, 0);
      let balance = totalDebit - totalCredit;
      if (account.type === "LIABILITY" || account.type === "EQUITY") {
        balance = totalCredit - totalDebit;
      }
      return { code: account.code, name: account.name, type: account.type, balance };
    });

    const assets = balances.filter((b) => b.type === "ASSET");
    const liabilities = balances.filter((b) => b.type === "LIABILITY");
    const equity = balances.filter((b) => b.type === "EQUITY");

    const totalAssets = assets.reduce((s, b) => s + b.balance, 0);
    const totalLiabilities = liabilities.reduce((s, b) => s + b.balance, 0);
    const totalEquity = equity.reduce((s, b) => s + b.balance, 0);

    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity };
  }

  async getIncomeStatement(tenantId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { tenantId, isActive: true, type: { in: ["REVENUE", "EXPENSE"] } },
      include: {
        journalLines: true,
      },
    });

    const balances = accounts.map((account) => {
      const totalDebit = account.journalLines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, l) => sum + l.credit, 0);
      const balance = account.type === "REVENUE" ? totalCredit - totalDebit : totalDebit - totalCredit;
      return { code: account.code, name: account.name, type: account.type, balance };
    });

    const revenues = balances.filter((b) => b.type === "REVENUE");
    const expenses = balances.filter((b) => b.type === "EXPENSE");
    const totalRevenue = revenues.reduce((s, b) => s + b.balance, 0);
    const totalExpense = expenses.reduce((s, b) => s + b.balance, 0);
    const netIncome = totalRevenue - totalExpense;

    return { revenues, expenses, totalRevenue, totalExpense, netIncome };
  }

  async getTrialBalance(tenantId: string) {
    const accounts = await this.prisma.account.findMany({
      where: { tenantId, isActive: true },
      include: {
        journalLines: true,
      },
    });

    const rows = accounts.map((account) => {
      const totalDebit = account.journalLines.reduce((sum, l) => sum + l.debit, 0);
      const totalCredit = account.journalLines.reduce((sum, l) => sum + l.credit, 0);
      return { code: account.code, name: account.name, debit: totalDebit, credit: totalCredit };
    });

    const totalDebit = rows.reduce((s, r) => s + r.debit, 0);
    const totalCredit = rows.reduce((s, r) => s + r.credit, 0);

    return { rows, totalDebit, totalCredit };
  }
}
