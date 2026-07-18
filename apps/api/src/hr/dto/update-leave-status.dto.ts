import { IsEnum } from "class-validator";

export enum LeaveStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
}

export class UpdateLeaveStatusDto {
  @IsEnum(LeaveStatus)
  status: LeaveStatus;
}
