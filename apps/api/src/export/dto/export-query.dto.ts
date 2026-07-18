import { IsOptional, IsString } from "class-validator";

export class ExportQueryDto {
  @IsOptional()
  @IsString()
  format?: string = "csv";

  @IsOptional()
  @IsString()
  ids?: string;

  @IsOptional()
  @IsString()
  columns?: string;
}
