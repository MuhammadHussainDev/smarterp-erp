import { IsString, IsOptional, IsEnum, IsBoolean, IsUUID } from "class-validator";

export enum AccountTypeEnum {
  ASSET = "ASSET",
  LIABILITY = "LIABILITY",
  EQUITY = "EQUITY",
  REVENUE = "REVENUE",
  EXPENSE = "EXPENSE",
}

export class CreateAccountDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsEnum(AccountTypeEnum)
  type: AccountTypeEnum;

  @IsOptional()
  @IsUUID()
  parentId?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
