import { IsNumber, IsUUID } from "class-validator";

export class CreateBudgetDto {
  @IsNumber()
  fiscalYear: number;

  @IsUUID()
  accountId: string;

  @IsNumber()
  amount: number;
}
