import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { RegisterDto } from '../dto/register.dto';
import { ApiError } from '../../../common/exceptions/api-error';
import * as bcrypt from 'bcrypt';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { ProfileService } from '@/modules/profile/services/profile.service';
import { WalletService } from '@/modules/wallet/services/wallet.service';
import { Op } from 'sequelize';
@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private profileService: ProfileService,
    private walletService: WalletService,
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
    await this.profileService.createProfile(user);
    await this.walletService.createWallet(user._id);
    const { password, ...result } = user;
    return result;
  }

  async login(loginDto: LoginDto): Promise<any> {
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw ApiError.Unauthorized('Invalid email or password');
    }
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw ApiError.Unauthorized('Invalid email or password');
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

  async validateUser(id: string) {
    const user = await this.userRepository.getById(id);
    if (!user) {
      throw ApiError.NotFound('User not found');
    }
    return user;
  }
}
