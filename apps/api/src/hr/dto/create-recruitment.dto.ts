import { IsString, IsOptional } from "class-validator";

export class CreateRecruitmentDto {
  @IsString()
  position: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  requirements?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
