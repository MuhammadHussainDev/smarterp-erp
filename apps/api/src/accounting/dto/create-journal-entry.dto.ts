import { IsString, IsOptional, IsArray, IsUUID, IsNumber, Min, ValidateNested, ArrayMinSize, ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments, Validate } from "class-validator";
import { Type } from "class-transformer";

export class JournalEntryLineDto {
  @IsUUID()
  accountId: string;

  @IsNumber()
  @Min(0)
  debit: number;

  @IsNumber()
  @Min(0)
  credit: number;

  @IsOptional()
  @IsString()
  description?: string;
}

@ValidatorConstraint({ name: "debitsEqualCredits", async: false })
export class DebitsEqualCreditsConstraint implements ValidatorConstraintInterface {
  validate(lines: JournalEntryLineDto[], args: ValidationArguments) {
    if (!lines || lines.length === 0) return false;
    const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
    const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
    return Math.abs(totalDebit - totalCredit) < 0.001;
  }

  defaultMessage(args: ValidationArguments) {
    return "Total debits must equal total credits";
  }
}

export class CreateJournalEntryDto {
  @IsOptional()
  @IsString()
  date?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  reference?: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => JournalEntryLineDto)
  @Validate(DebitsEqualCreditsConstraint)
  lines: JournalEntryLineDto[];
}
