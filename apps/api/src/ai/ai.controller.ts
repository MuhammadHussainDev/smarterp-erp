import { Controller, Get, Post, Body, Param, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AiService } from "./ai.service";
import { ChatDto } from "./dto/chat.dto";
import { SentimentDto } from "./dto/sentiment.dto";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("ai")
@Controller("ai")
export class AiController {
  constructor(private service: AiService) {}

  @Post("chat")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: "Chat with AI assistant" })
  chat(@CurrentUser("tenantId") tenantId: string, @Body() dto: ChatDto) {
    return this.service.chat(tenantId, dto.message);
  }

  @Get("predictions")
  @ApiOperation({ summary: "Get business predictions" })
  getPredictions(@CurrentUser("tenantId") tenantId: string) {
    return this.service.getPredictions(tenantId);
  }

  @Get("suggestions/:context")
  @ApiOperation({ summary: "Get smart suggestions for a context" })
  getSuggestions(
    @CurrentUser("tenantId") tenantId: string,
    @Param("context") context: string,
  ) {
    return this.service.getSuggestions(tenantId, context);
  }

  @Post("sentiment")
  @UsePipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }))
  @ApiOperation({ summary: "Analyze sentiment of text" })
  analyzeSentiment(@CurrentUser("tenantId") tenantId: string, @Body() dto: SentimentDto) {
    return this.service.analyzeSentiment(tenantId, dto.text);
  }
}
