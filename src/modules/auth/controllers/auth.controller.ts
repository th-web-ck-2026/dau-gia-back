import { Controller, Post, Body, HttpCode, HttpStatus, Req, Query } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiError } from '../../../common/exceptions/api-error';

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
  async login(
    @Query('provider') provider: string,
    @Body() loginDto: LoginDto,
    @Req() request: Request,
  ) {
    if (!provider) {
      throw ApiError.BadRequest('Provider query parameter is required (email|google)');
    }
    return this.authService.login(provider, loginDto, request);
  }

  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ) {
    return this.authService.refresh(refreshTokenDto.refreshToken, request);
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

  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Post('logout-all')
  async logoutAll(@Req() request: any) {
    const userId = request.user.id;
    return this.authService.logoutAll(userId);
  }

  @Post('change-password')
  async changePassword(
    @Req() request: any,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const userId = request.user.id;
    return this.authService.changePassword(
      userId,
      changePasswordDto.oldPassword,
      changePasswordDto.newPassword,
      changePasswordDto.logoutOtherDevices || false,
    );
  }
}
