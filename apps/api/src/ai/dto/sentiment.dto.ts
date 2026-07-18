import { IsString, IsNotEmpty } from "class-validator";

export class SentimentDto {
  @IsString()
  @IsNotEmpty()
  text: string;
}
