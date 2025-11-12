import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ApiError } from '../../../common/exceptions/api-error';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { Op } from 'sequelize';
import { UserStatus } from '@/modules/user/common/constant';
import { SendMailService } from '@/modules/send-mail/services/send-mail.service';
@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private sendMailService: SendMailService,
    private jwtService: JwtService,
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
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw ApiError.Unauthorized('Email hoặc mật khẩu không đúng');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw ApiError.Unauthorized('Email hoặc mật khẩu không đúng');
    }
    if (user.userStatus === UserStatus.BLOCKED) {
      throw ApiError.Unauthorized('Tài khoản đã bị khóa');
    }

    const payload = {
      sub: user._id,
      id: user._id,
      fullname: user.fullname,
      email: user.email,
      avatar: user.avatar,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user._id,
        email: user.email,
        fullname: user.fullname,
        avatar: user.avatar,
        role: user.role,
      },
    };
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
