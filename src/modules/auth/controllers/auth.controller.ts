import { Controller, Post, Body, HttpCode, HttpStatus, Req } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() loginDto: LoginDto, @Req() request: Request) {
    return this.authService.loginWithEmail(loginDto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(@Body() refreshTokenDto: RefreshTokenDto, @Req() request: Request) {
    return this.authService.refreshTokens(refreshTokenDto.refreshToken, request);
  }
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }
  @Post('reset-password/token')
  async resetPasswordByToken(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
  @Post('reset-password/password')
  async resetPasswordByOldPassword(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }
}
