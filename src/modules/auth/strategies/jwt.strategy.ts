import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiError } from '../../../common/exceptions/api-error';
import { UserRepository } from '@/modules/user/repositories/user.repository';
import { UserStatus } from '@/modules/user/common/constant';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private userRepository: UserRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.getById(payload.sub);
    if (!user) {
      throw ApiError.Unauthorized('Người dùng không tồn tại');
    }
    if (user.userStatus === UserStatus.BLOCKED) {
      throw ApiError.Unauthorized('Người dùng đã bị khóa');
    }
    return {
      id: payload.sub,
      fullname: payload.fullname,
      email: payload.email,
      role: payload.role,
      userRoles: user.userRoles,
      phone: payload.phone,
      status: user.userStatus,
    };
  }
}
