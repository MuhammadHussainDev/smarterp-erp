import {
  Controller,
  Get,
  Param,
  Query,
  Res,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { Response } from "express";
import { PrismaService } from "../prisma/prisma.service";
import { ExportService } from "./export.service";
import { ExportQueryDto } from "./dto/export-query.dto";

@ApiTags("export")
@Controller("export")
export class ExportController {
  private readonly entityMap: Record<string, string> = {
    product: "product",
    customer: "customer",
    contact: "contact",
    lead: "lead",
    opportunity: "opportunity",
    supplier: "supplier",
    quotation: "quotation",
    salesOrder: "salesOrder",
    invoice: "invoice",
    account: "account",
    employee: "employee",
    attendance: "attendance",
  };

  constructor(
    private prisma: PrismaService,
    private exportService: ExportService,
  ) {}

  @Get(":entity")
  @ApiOperation({ summary: "Export entity data as CSV or JSON" })
  async export(
    @Param("entity") entity: string,
    @Query() query: ExportQueryDto,
    @Res() res: Response,
  ) {
    const modelName = this.entityMap[entity];
    if (!modelName) {
      throw new NotFoundException(`Unknown entity: ${entity}`);
    }

    const ids = query.ids
      ? query.ids.split(",").map((id) => id.trim()).filter(Boolean)
      : [];

    if (ids.length === 0) {
      throw new BadRequestException("At least one id is required");
    }

    const model = (this.prisma as any)[modelName];
    if (!model || typeof model.findMany !== "function") {
      throw new NotFoundException(`Entity not available: ${entity}`);
    }

    const records = await model.findMany({
      where: { id: { in: ids } },
    });

    if (records.length === 0) {
      throw new NotFoundException(`No ${entity} records found`);
    }

    const columns = query.columns
      ? query.columns.split(",").map((c) => c.trim()).filter(Boolean)
      : undefined;

    const format = query.format || "csv";

    if (format === "json") {
      const json = this.exportService.toJson(records);
      const filename = this.exportService.generateFilename(entity, "json");
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
      return res.send(json);
    }

    const colDefs = columns
      ? columns.map((c) => ({ key: c, label: c }))
      : undefined;

    const csv = this.exportService.toCsv(records, colDefs);
    const filename = this.exportService.generateFilename(entity, "csv");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    return res.send(csv);
  }
}
