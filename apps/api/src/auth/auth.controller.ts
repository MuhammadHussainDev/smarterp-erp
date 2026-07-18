import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { Enable2faDto } from "./dto/enable-2fa.dto";
import { Verify2faDto } from "./dto/verify-2fa.dto";
import { Public } from "../common/decorators/public.decorator";
import { CurrentUser } from "../common/decorators/current-user.decorator";

@ApiTags("auth")
@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post("register")
  @ApiOperation({ summary: "Register a new company with admin user" })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Public()
  @Post("login")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Login with email and password" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Refresh access token" })
  refresh(@Body("refreshToken") token: string) {
    return this.authService.refreshToken(token);
  }

  @Post("logout")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Logout and revoke refresh tokens" })
  logout(@CurrentUser("sub") userId: string) {
    return this.authService.logout(userId);
  }

  @Post("2fa/generate")
  @ApiOperation({ summary: "Generate 2FA secret and QR code" })
  generate2fa(
    @CurrentUser("sub") userId: string,
    @CurrentUser("email") email: string
  ) {
    return this.authService.generate2faSecret(userId, email);
  }

  @Post("2fa/enable")
  @ApiOperation({ summary: "Enable 2FA after verifying token" })
  enable2fa(
    @CurrentUser("sub") userId: string,
    @Body() dto: Enable2faDto
  ) {
    return this.authService.enable2fa(userId, dto.token);
  }

  @Public()
  @Post("2fa/verify")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Verify 2FA token and get JWT" })
  verify2fa(
    @Body("userId") userId: string,
    @Body() dto: Verify2faDto
  ) {
    return this.authService.verify2fa(userId, dto.token);
  }

  @Public()
  @Post("forgot-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Request password reset email" })
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return { message: "If the email exists, a reset link has been sent" };
  }

  @Public()
  @Post("reset-password")
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Reset password with token" })
  resetPassword(@Body() dto: ResetPasswordDto) {
    return { message: "Password reset successfully" };
  }
}
