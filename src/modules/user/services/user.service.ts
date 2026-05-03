import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../../../common/exceptions/api-error';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService extends BaseService<User> {
  constructor(private readonly userRepository: UserRepository) {
    super(userRepository);
  }
  async updateUserProfile(user: AuthUser, updateUserDto: UpdateUserProfileDto) {
    const { phone } = updateUserDto;
    if (phone) {
      const existingUser = await this.userRepository.getOne({
        where: { phone },
        attributes: ['_id'],
      });
      if (existingUser && existingUser._id !== user.id) {
        throw ApiError.Conflict('Số điện thoại đã tồn tại');
      }
    }
    const userUpdate = await this.userRepository.updateOne(updateUserDto, {
      where: { _id: user.id },
    });
    if (!userUpdate) {
      throw ApiError.NotFound('Người dùng không tồn tại');
    }
    return userUpdate;
  }

  async updatePassword(
    userId: string,
    updateUserPasswordDto: UpdateUserPasswordDto,
  ) {
    // NOTE: This method is deprecated and should be removed.
    // Password management is now handled by AuthService.changePassword()
    // which uses AuthProviderService to update credentials.
    throw ApiError.BadRequest('Please use /auth/change-password endpoint');
  }
  async updateUserAvatar(userId: string, avatar: string) {
    const result = await this.userRepository.updateOne(
      { avatar },
      { where: { _id: userId } },
    );

    return result;
  }
}
