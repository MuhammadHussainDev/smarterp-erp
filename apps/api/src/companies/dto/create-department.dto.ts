import { IsString, IsOptional } from "class-validator";

export class CreateDepartmentDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  branchId?: string;

  @IsOptional()
  @IsString()
  headId?: string;
}
