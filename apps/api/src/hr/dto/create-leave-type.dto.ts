import { IsString, IsNumber, Min } from "class-validator";

export class CreateLeaveTypeDto {
  @IsString()
  name: string;

  @IsNumber()
  @Min(1)
  daysAllowed: number;
}
