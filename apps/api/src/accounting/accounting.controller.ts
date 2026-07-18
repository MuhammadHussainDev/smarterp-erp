import { Controller, Get, Post, Patch, Delete, Body, Param, Query, UsePipes, ValidationPipe, ParseUUIDPipe } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AccountingService } from "./accounting.service";
import { CurrentUser } from "../common/decorators/current-user.decorator";
import { CreateAccountDto } from "./dto/create-account.dto";
import { UpdateAccountDto } from "./dto/update-account.dto";
import { CreateJournalEntryDto } from "./dto/create-journal-entry.dto";
import { CreateBudgetDto } from "./dto/create-budget.dto";
import { UpdateBudgetDto } from "./dto/update-budget.dto";
import { CreateTaxRateDto } from "./dto/create-tax-rate.dto";
import { UpdateTaxRateDto } from "./dto/update-tax-rate.dto";

@ApiTags("accounting")
@Controller("accounting")
export class AccountingController {
  constructor(private service: AccountingService) {}

  // ── Chart of Accounts ─────────────────────────────────────────

  @Get("accounts")
  @ApiOperation({ summary: "List all accounts" })
  findAllAccounts(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllAccounts(tenantId);
  }

  @Get("accounts/:id")
  @ApiOperation({ summary: "Get account by id" })
  findOneAccount(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneAccount(tenantId, id);
  }

  @Post("accounts")
  @ApiOperation({ summary: "Create account" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createAccount(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateAccountDto) {
    return this.service.createAccount(tenantId, dto);
  }

  @Patch("accounts/:id")
  @ApiOperation({ summary: "Update account" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateAccount(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateAccountDto) {
    return this.service.updateAccount(tenantId, id, dto);
  }

  @Delete("accounts/:id")
  @ApiOperation({ summary: "Deactivate account" })
  removeAccount(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeAccount(tenantId, id);
  }

  // ── Journal Entries ───────────────────────────────────────────

  @Get("journal")
  @ApiOperation({ summary: "List journal entries" })
  findAllJournalEntries(@CurrentUser("tenantId") tenantId: string, @Query("page") page?: number, @Query("limit") limit?: number) {
    return this.service.findAllJournalEntries(tenantId, page, limit);
  }

  @Get("journal/:id")
  @ApiOperation({ summary: "Get journal entry" })
  findOneJournalEntry(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneJournalEntry(tenantId, id);
  }

  @Post("journal")
  @ApiOperation({ summary: "Create journal entry" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createJournalEntry(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateJournalEntryDto) {
    return this.service.createJournalEntry(tenantId, dto);
  }

  // ── Budgets ───────────────────────────────────────────────────

  @Get("budgets")
  @ApiOperation({ summary: "List budgets" })
  findAllBudgets(@CurrentUser("tenantId") tenantId: string, @Query("fiscalYear") fiscalYear?: number) {
    return this.service.findAllBudgets(tenantId, fiscalYear ? Number(fiscalYear) : undefined);
  }

  @Get("budgets/:id")
  @ApiOperation({ summary: "Get budget" })
  findOneBudget(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneBudget(tenantId, id);
  }

  @Post("budgets")
  @ApiOperation({ summary: "Create budget" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createBudget(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateBudgetDto) {
    return this.service.createBudget(tenantId, dto);
  }

  @Patch("budgets/:id")
  @ApiOperation({ summary: "Update budget" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateBudget(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateBudgetDto) {
    return this.service.updateBudget(tenantId, id, dto);
  }

  @Delete("budgets/:id")
  @ApiOperation({ summary: "Delete budget" })
  removeBudget(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeBudget(tenantId, id);
  }

  // ── Tax Rates ─────────────────────────────────────────────────

  @Get("tax-rates")
  @ApiOperation({ summary: "List tax rates" })
  findAllTaxRates(@CurrentUser("tenantId") tenantId: string) {
    return this.service.findAllTaxRates(tenantId);
  }

  @Get("tax-rates/:id")
  @ApiOperation({ summary: "Get tax rate" })
  findOneTaxRate(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.findOneTaxRate(tenantId, id);
  }

  @Post("tax-rates")
  @ApiOperation({ summary: "Create tax rate" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  createTaxRate(@CurrentUser("tenantId") tenantId: string, @Body() dto: CreateTaxRateDto) {
    return this.service.createTaxRate(tenantId, dto);
  }

  @Patch("tax-rates/:id")
  @ApiOperation({ summary: "Update tax rate" })
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  updateTaxRate(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string, @Body() dto: UpdateTaxRateDto) {
    return this.service.updateTaxRate(tenantId, id, dto);
  }

  @Delete("tax-rates/:id")
  @ApiOperation({ summary: "Delete tax rate" })
  removeTaxRate(@CurrentUser("tenantId") tenantId: string, @Param("id", ParseUUIDPipe) id: string) {
    return this.service.removeTaxRate(tenantId, id);
  }

  // ── Reports ───────────────────────────────────────────────────

  @Get("reports/balance-sheet")
  @ApiOperation({ summary: "Get balance sheet" })
  getBalanceSheet(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getBalanceSheet(tenantId);
  }

  @Get("reports/income-statement")
  @ApiOperation({ summary: "Get income statement" })
  getIncomeStatement(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getIncomeStatement(tenantId);
  }

  @Get("reports/trial-balance")
  @ApiOperation({ summary: "Get trial balance" })
  getTrialBalance(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getTrialBalance(tenantId);
  }
}
