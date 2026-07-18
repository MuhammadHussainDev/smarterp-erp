import { IsUUID, IsOptional, IsDateString, IsNumber, Min, Max, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateReviewDto {
  @ApiProperty()
  @IsUUID()
  employeeId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  reviewerId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  reviewDate?: string;

  @ApiPropertyOptional({ minimum: 1, maximum: 10 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  rating?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  comments?: string;
}
