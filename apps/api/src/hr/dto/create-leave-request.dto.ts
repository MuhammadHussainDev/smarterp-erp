import { IsUUID, IsISO8601, IsOptional, IsString } from "class-validator";

export class CreateLeaveRequestDto {
  @IsUUID()
  employeeId: string;

  @IsUUID()
  leaveTypeId: string;

  @IsISO8601()
  startDate: string;

  @IsISO8601()
  endDate: string;

  @IsOptional()
  @IsString()
  reason?: string;
}
