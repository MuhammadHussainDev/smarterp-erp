import { IsString, IsNumber, IsOptional, IsBoolean, Min, Max } from "class-validator";

export class CreateTaxRateDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(0)
  @Max(100)
  rate: number;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
