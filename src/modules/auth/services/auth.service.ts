import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ApiError } from '../../../common/exceptions/api-error';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { Op } from 'sequelize';
import { UserStatus } from '@/modules/user/common/constant';
import { SendMailService } from '@/modules/send-mail/services/send-mail.service';
import { User } from '@/modules/user/entities/user.entity';
@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sendMailService: SendMailService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const existingUser = await this.userRepository.getOne({
      where: {
        [Op.or]: [{ email: registerDto.email }, { phone: registerDto.phone }],
      },
    });
    if (existingUser) {
      throw ApiError.Conflict('Email hoặc số điện thoại đã tồn tại');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);
    const user = await this.userRepository.create({
      ...registerDto,
      password: hashedPassword,
    });
    // create profile when create user
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<any> {
    if (loginDto.refreshToken) {
      return this.refreshTokens(loginDto.refreshToken);
    }

    if (!loginDto.username || !loginDto.password) {
      throw ApiError.BadRequest('Thiếu thông tin đăng nhập');
    }

    const user = await this.userRepository.findByLoginIdentifier(
      loginDto.username,
    );
    if (!user) {
      throw ApiError.Unauthorized('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw ApiError.Unauthorized('Tên đăng nhập hoặc mật khẩu không đúng');
    }
    if (user.userStatus === UserStatus.BLOCKED) {
      throw ApiError.Unauthorized('Tài khoản đã bị khóa');
    }

    const tokens = await this.issueTokens(user);

    return this.buildAuthResponse(user, tokens);
  }

  private async generateRefreshToken(userId: string): Promise<string> {
    const refreshTokenPayload = { sub: userId };
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      secret: this.getRefreshSecret(),
      expiresIn: this.getRefreshExpiresIn(),
    });
    await this.userRepository.updateOne(
      { refreshToken },
      { where: { _id: userId } },
    );
    return refreshToken;
  }

  async refreshTokens(refreshToken: string): Promise<any> {
    const user = await this.validateRefreshToken(refreshToken);
    const tokens = await this.issueTokens(user);
    return this.buildAuthResponse(user, tokens);
  }

  private async issueTokens(user: User) {
    const payload = this.buildJwtPayload(user);
    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(user._id);
    return { accessToken, refreshToken };
  }

  private buildAuthResponse(
    user: User,
    tokens: { accessToken: string; refreshToken: string },
  ) {
    return {
      access_token: tokens.accessToken,
      refresh_token: tokens.refreshToken,
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        role: user.role,
      },
    };
  }

  private buildJwtPayload(user: User) {
    return {
      sub: user._id,
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };
  }

  private getRefreshSecret(): string {
    return (
      this.configService.get<string>('jwt.refreshSecret') ||
      this.configService.get<string>('jwt.secret')
    );
  }

  private getRefreshExpiresIn(): string {
    return (
      this.configService.get<string>('jwt.refreshExpiresIn') ||
      this.configService.get<string>('jwt.expiresIn')
    );
  }

  private async validateRefreshToken(refreshToken: string): Promise<User> {
    try {
      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.getRefreshSecret(),
      });
      const user = await this.userRepository.getById(decoded.sub);
      if (!user || user.refreshToken !== refreshToken) {
        throw ApiError.Unauthorized('Invalid refresh token');
      }
      return user;
    } catch (error) {
      throw ApiError.Unauthorized('Invalid refresh token');
    }
  }

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
  async resetPassword(token: string, newPassword: string) {
    const decodedToken = await this.validateToken(token);
    const user = await this.userRepository.getById(decodedToken.id);
    if (!user) {
      throw ApiError.NotFound('Người dùng không tồn tại');
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.userRepository.updateOne(
      { password: hashedPassword },
      { where: { _id: user._id } },
    );
    return { message: 'Cập nhật mật khẩu thành công' };
  }
  

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
