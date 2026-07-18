import { IsNumber, IsOptional, IsString, Min, Max } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePayrollDto {
  @ApiProperty({ example: 7 })
  @IsNumber()
  @Min(1)
  @Max(12)
  month: number;

  @ApiProperty({ example: 2025 })
  @IsNumber()
  year: number;

  @ApiPropertyOptional({ default: "DRAFT" })
  @IsOptional()
  @IsString()
  status?: string;
}
