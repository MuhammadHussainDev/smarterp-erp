import { IsOptional, IsNumber, Min } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePayrollItemDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  allowances?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  deductions?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  @Min(0)
  tax?: number;
}
