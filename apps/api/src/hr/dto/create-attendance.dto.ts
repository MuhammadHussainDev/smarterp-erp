import { IsUUID, IsISO8601, IsOptional, IsString } from "class-validator";

export class CreateAttendanceDto {
  @IsUUID()
  employeeId: string;

  @IsISO8601()
  date: string;

  @IsOptional()
  @IsISO8601()
  checkIn?: string;

  @IsOptional()
  @IsISO8601()
  checkOut?: string;

  @IsOptional()
  @IsString()
  status?: string;
}
