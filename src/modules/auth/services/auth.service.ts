import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthProviderService } from './auth-provider.service';
import { AuthSessionService } from './auth-session.service';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { SendMailService } from '@/modules/send-mail/services/send-mail.service';
import { ApiError } from '@/common/exceptions/api-error';
import { AuthProvider } from '../common/constants';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { Op } from 'sequelize';
import { RegisterDto } from '../dto/register.dto';
import { UserRoles, UserRoleType, UserStatus } from '@/modules/user/common/constant';
import { EmailCredentials, GoogleCredentials } from '../common/interface';

@Injectable()
export class AuthService implements OnModuleInit {
  constructor(
    private authProviderService: AuthProviderService,
    private authSessionService: AuthSessionService,
    private userRepository: UserRepository,
    private sendMailService: SendMailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  // init Admin
  async onModuleInit() {
    const admin = await this.userRepository.findByEmail(process.env.ADMIN_EMAIL);
    if (!admin) {
      const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);
      const adminUser = await this.userRepository.create({
        email: process.env.ADMIN_EMAIL,
        password: hashedPassword,
        role: UserRoles.ADMIN,
        userStatus: UserStatus.ACTIVE,
        fullname: 'Admin',
      });
      await this.authProviderService.createProvider(
        adminUser._id,
        AuthProvider.EMAIL,
        adminUser.email,
        hashedPassword,
      );
    }
  }

  // Login method - delegates to provider-specific handlers
  async login(provider: string, credentials: GoogleCredentials | EmailCredentials, request: Request) {
    if (provider === AuthProvider.EMAIL) {
      const emailCreds = credentials as EmailCredentials;
      return this.handleEmailLogin(emailCreds.email, emailCreds.password, request);
    } else if (provider === AuthProvider.GOOGLE) {
      const googleCreds = credentials as GoogleCredentials;
      return this.handleGoogleLogin(googleCreds, request);
    }
    throw ApiError.BadRequest('Invalid provider');
  }

  // Backward compatibility wrapper for old controller
  async loginWithEmail(loginDto: any, request: Request) {
    if (loginDto.idToken) {
      return this.login(AuthProvider.GOOGLE, { idToken: loginDto.idToken }, request);
    }
    return this.login(AuthProvider.EMAIL, { email: loginDto.email, password: loginDto.password }, request);
  }

  // Backward compatibility wrapper for refresh
  async refreshTokens(refreshToken: string, request: Request) {
    return this.refresh(refreshToken, request);
  }

  // Email login handler
  private async handleEmailLogin(email: string, password: string, request: Request) {
    const user = await this.authProviderService.verifyEmailPassword(email, password);

    if (user.userStatus === 'blocked') {
      throw ApiError.Forbidden('Tài khoản đã bị khóa');
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = uuidv4();

    await this.authSessionService.createSession(user._id, refreshToken, request);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        role: user.role,
        userRoles: user.userRoles,
      },
    };
  }

  // Google login handler
  private async handleGoogleLogin(credentials: GoogleCredentials, request: Request) {
    let googleData;
    if (credentials.code) {
      const idToken = await this.authProviderService.codeToIdTokenGoogle(credentials.code);
      googleData = await this.authProviderService.verifyGoogleToken(idToken);
    } else if (credentials.idToken) {
      googleData = await this.authProviderService.verifyGoogleToken(credentials.idToken);
    } else {
      throw ApiError.BadRequest('Invalid google credentials');
    }

    let authProvider = await this.authProviderService.findByProvider(
      AuthProvider.GOOGLE,
      googleData.googleSub,
    );

    let user;
    if (!authProvider) {
      user = await this.userRepository.findByEmail(googleData.email);

      if (user) {
        if (!user.userRoles && credentials.userRoles) {
          user.userRoles = credentials.userRoles;
          await this.userRepository.updateOne({ userRoles: credentials.userRoles }, {
            where: { _id: user._id }
          });
        }
        authProvider = await this.authProviderService.createProvider(
          user._id,
          AuthProvider.GOOGLE,
          googleData.googleSub,
        );
      } else {
        user = await this.userRepository.create({
          email: googleData.email,
          fullname: googleData.name,
          avatar: googleData.avatar,
          role: UserRoles.USER,
          userRoles: credentials.userRoles || null,
        });
        authProvider = await this.authProviderService.createProvider(
          user._id,
          AuthProvider.GOOGLE,
          googleData.googleSub,
        );
      }
    } else {
      user = authProvider.user;
      if (!user) {
        // Fallback if provider exists but user is missing
        user = await this.userRepository.findByEmail(googleData.email);
        if (!user) {
           user = await this.userRepository.create({
            email: googleData.email,
            fullname: googleData.name,
            avatar: googleData.avatar,
            role: UserRoles.USER,
            userRoles: credentials.userRoles || null,
          });
        } else if (!user.userRoles && credentials.userRoles) {
          user.userRoles = credentials.userRoles;
          await this.userRepository.updateOne({ userRoles: credentials.userRoles }, {
            where: { _id: user._id }
          });
        }
      } else if (!user.userRoles && credentials.userRoles) {
        user.userRoles = credentials.userRoles;
        await this.userRepository.updateOne({ userRoles: credentials.userRoles }, {
          where: { _id: user._id }
        });
      }
    }

    const accessToken = this.generateAccessToken(user);
    const refreshToken = uuidv4();

    await this.authSessionService.createSession(user._id, refreshToken, request);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        role: user.role,
        userRoles: user.userRoles,
      },
    };
  }

  // Register new user
  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.getOne({
      where: {
        [Op.or]: [
          { email: registerDto.email },
          { phone: registerDto.phone },
          { soCccd: registerDto.soCccd },
        ],
      },
    });

    if (existingUser) {
      throw ApiError.Conflict('Tài khoản đã tồn tại');
    }

    const user = await this.userRepository.create({
      email: registerDto.email,
      fullname: registerDto.fullname,
      phone: registerDto.phone,
      soCccd: registerDto.soCccd,
      role: UserRoles.USER,
      userRoles: registerDto.userRoles,
    });

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    await this.authProviderService.createProvider(
      user._id,
      AuthProvider.EMAIL,
      registerDto.email,
      hashedPassword,
    );

    const { password, ...result } = user as any;
    return result;
  }

  // Refresh access token
  async refresh(refreshToken: string, request: Request) {
    const session = await this.authSessionService.findByRefreshToken(refreshToken);

    if (!session || session.expiresAt < new Date()) {
      throw ApiError.Unauthorized('Invalid or expired refresh token');
    }

    const user = await this.userRepository.getById(session.userId);
    if (!user) {
      throw ApiError.Unauthorized('User not found');
    }

    await this.authSessionService.rotateToken(session._id, refreshToken);

    const accessToken = this.generateAccessToken(user);
    const newRefreshToken = uuidv4();

    await this.authSessionService.createSession(user._id, newRefreshToken, request);

    return {
      access_token: accessToken,
      refresh_token: newRefreshToken,
    };
  }

  // Logout from current device
  async logout(refreshToken: string) {
    await this.authSessionService.deleteSession(refreshToken);
    return { message: 'Logged out successfully' };
  }

  // Logout from all devices
  async logoutAll(userId: string, currentSessionId?: string) {
    await this.authSessionService.deleteAllSessions(userId, currentSessionId);
    return { message: 'Logged out from all devices' };
  }

  // Change password
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string,
    logoutOtherDevices: boolean,
  ) {
    const user = await this.userRepository.getById(userId);
    await this.authProviderService.verifyEmailPassword(user.email, oldPassword);

    await this.authProviderService.updateCredentials(userId, AuthProvider.EMAIL, newPassword);

    if (logoutOtherDevices) {
      await this.authSessionService.deleteAllSessions(userId);
    }

    return { message: 'Password changed successfully' };
  }

  // Select user role (one-time choice)
  async selectRole(userId: string, userRoles: UserRoleType) {
    const user = await this.userRepository.getById(userId);
    if (!user) {
      throw ApiError.NotFound('Người dùng không tồn tại');
    }
    if (user.userRoles) {
      throw ApiError.BadRequest('Tài khoản đã được thiết lập vai trò');
    }

    user.userRoles = userRoles;
    await this.userRepository.updateOne({ userRoles }, {
      where: { _id: userId },
    });

    const accessToken = this.generateAccessToken(user);

    return {
      access_token: accessToken,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        role: user.role,
        userRoles: user.userRoles,
      },
    };
  }

  // Generate access token
  private generateAccessToken(user: any): string {
    const payload = {
      sub: user._id,
      id: user._id,
      email: user.email,
      fullname: user.fullname,
      avatar: user.avatar,
      role: user.role,
      userRoles: user.userRoles,
    };
    return this.jwtService.sign(payload);
  }

  // Forgot password - kept from original
  async forgotPassword(email: string) {
    const tokenExpies = process.env.PASSWORD_RESET_TOKEN_EXPIRES_IN_MINUTES;
    const expiresIn = tokenExpies + 'm';
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.NotFound('Email không tồn tại');
    }
    const token = await this.generateToken({ id: user._id }, expiresIn);
    await this.sendMailService.sendPasswordReset(user, token);
  }

  // Reset password - kept from original
  async resetPassword(token: string, newPassword: string) {
    const decodedToken = await this.validateToken(token);
    const user = await this.userRepository.getById(decodedToken.id);
    if (!user) {
      throw ApiError.NotFound('Người dùng không tồn tại');
    }
    await this.authProviderService.updateCredentials(user._id, AuthProvider.EMAIL, newPassword);
    return { message: 'Cập nhật mật khẩu thành công' };
  }

  // Helper methods for forgotPassword/resetPassword
  async generateToken(payload: any, expiresIn?: string) {
    return this.jwtService.sign(payload, { expiresIn });
  }

  async validateToken(token: string) {
    try {
      const decoded = this.jwtService.verify(token);
      return decoded;
    } catch (error) {
      throw ApiError.Unauthorized('Invalid token');
    }
  }

  async validateUser(id: string) {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw ApiError.NotFound('User not found');
    }
    return user;
  }
}
