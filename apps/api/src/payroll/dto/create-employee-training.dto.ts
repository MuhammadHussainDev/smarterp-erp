import { IsUUID } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class CreateEmployeeTrainingDto {
  @ApiProperty()
  @IsUUID()
  employeeId: string;

  @ApiProperty()
  @IsUUID()
  trainingId: string;
}
