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
    const { old_password, new_password } = updateUserPasswordDto;
    const user = await this.userRepository.getOne({
      where: { _id: userId },
      attributes: ['_id', 'password'],
    });
    if (!user) {
      throw ApiError.NotFound('Người dùng không tồn tại');
    }
    const isOldPasswordValid = await bcrypt.compare(
      old_password,
      user.password,
    );
    if (!isOldPasswordValid) {
      throw ApiError.BadRequest('Mật khẩu không chính xác');
    }
    const hashedPassword = await bcrypt.hash(new_password, 10);
    const result = await this.userRepository.updateOne(
      { password: hashedPassword },
      { where: { _id: userId } },
    );
    if (!result) {
      throw ApiError.InternalServerError('Cập nhật mật khẩu thất bại');
    }
    return { updated: true };
  }
  async updateUserAvatar(userId: string, avatar: string) {
    const result = await this.userRepository.updateOne(
      { avatar },
      { where: { _id: userId } },
    );

    return result;
  }
}
