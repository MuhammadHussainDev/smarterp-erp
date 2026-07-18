import { IsString, IsOptional, IsNumber, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateBenefitDto {
  @ApiProperty({ example: "Health Insurance" })
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: ["FIXED", "PERCENTAGE"], example: "FIXED" })
  @IsString()
  type: string;

  @ApiProperty({ example: 500 })
  @IsNumber()
  @Min(0)
  amount: number;
}
