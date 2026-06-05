import { Controller, Post, Body, HttpCode, HttpStatus, Req, Query } from '@nestjs/common';
import { AuthService } from '../services/auth.service';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { RefreshTokenDto } from '../dto/refresh-token.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { SelectRoleDto } from '../dto/select-role.dto';
import { Public } from '../../../common/decorators/public.decorator';
import { Auth } from '../../../common/decorators/auth.decorator';
import { Throttle } from '@nestjs/throttler';
import { Request } from 'express';
import { ApiError } from '../../../common/exceptions/api-error';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Public()
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

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  async refresh(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() request: Request,
  ) {
    return this.authService.refresh(refreshTokenDto.refreshToken, request);
  }
  @Public()
  @Throttle({ default: { limit: 1, ttl: 60000 } })
  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.forgotPassword(email);
  }
  @Public()
  @Post('reset-password/token')
  async resetPasswordByToken(
    @Body('token') token: string,
    @Body('newPassword') newPassword: string,
  ) {
    return this.authService.resetPassword(token, newPassword);
  }

  @Public()
  @Post('logout')
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }

  @Auth()
  @Post('logout-all')
  async logoutAll(@Req() request: any) {
    const userId = request.user.id;
    return this.authService.logoutAll(userId);
  }

  @Auth()
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

  @Auth()
  @Post('select-role')
  async selectRole(
    @Req() request: any,
    @Body() selectRoleDto: SelectRoleDto,
  ) {
    const userId = request.user.id;
    return this.authService.selectRole(userId, selectRoleDto.userRoles);
  }
}
