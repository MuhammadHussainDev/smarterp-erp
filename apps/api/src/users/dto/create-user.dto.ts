import { IsEmail, IsString, IsOptional, IsArray } from "class-validator";

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsArray()
  roleIds: string[];
}
