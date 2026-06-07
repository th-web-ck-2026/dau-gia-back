import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { User } from '../entities/user.entity';
import { UserRepository } from '../repositories/user.repository';
import { ApiError } from '../../../common/exceptions/api-error';
import { UpdateUserProfileDto } from '../dto/update-user-profile.dto';
import { UpdateUserPasswordDto } from '../dto/update-user-password.dto';
import { AuthUser } from '@/common/interfaces/auth-user.interface';
import * as bcrypt from 'bcrypt';
import { ConditionUserDto } from '../dto/condition-user.dto';
import { PageableDto } from '@/common/dto/pageable.dto';
import { UserRoles, UserStatus, UserRoleType } from '../common/constant';
import { QueryOption } from '@/common/pipe/query-option.interface';
import { Op } from 'sequelize';
import { UpdateUserAdminDto } from '../dto/update-user-admin.dto';

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
  async getDanhSachNguoiDung(
    user: AuthUser,
    search: string,
    query?: QueryOption,
  ): Promise<PageableDto<User>> {
    // Chống cào dữ liệu
    if (query.limit && query.limit > 10) {
      throw ApiError.BadRequest('Số lượng người dùng tối đa là 10');
    }
    // bắt buộc phải có condition
    if (!search || search.trim() === '' || search.trim().length < 3) {
      throw ApiError.BadRequest('Tìm kiếm phải có ít nhất 3 ký tự');
    }
    return this.userRepository.getPage(
      {
        where: {
          _id: { [Op.ne]: user.id },
          [Op.or]: [
            { fullname: { [Op.iLike]: `%${search}%` } },
            { email: { [Op.eq]: search } },
            { phone: { [Op.eq]: search } },
          ],
          userStatus: UserStatus.ACTIVE,
          role: UserRoles.USER,
        },
        attributes: ['_id', 'fullname', 'email', 'phone'],
      },
      query,
    );
  }

  async getPageAdmin(
    condition: any,
    query: QueryOption,
  ): Promise<PageableDto<User>> {
    return this.userRepository.getPage(
      {
        where: condition,
      },
      query,
    );
  }

  async updateUserByAdmin(userId: string, updateDto: UpdateUserAdminDto) {
    const { phone, email } = updateDto;
    if (phone) {
      const existingUser = await this.userRepository.getOne({
        where: { phone },
        attributes: ['_id'],
      });
      if (existingUser && existingUser._id !== userId) {
        throw ApiError.Conflict('Số điện thoại đã tồn tại');
      }
    }
    if (email) {
      const existingUser = await this.userRepository.getOne({
        where: { email },
        attributes: ['_id'],
      });
      if (existingUser && existingUser._id !== userId) {
        throw ApiError.Conflict('Email đã tồn tại');
      }
    }

    const updatedUser = await this.userRepository.updateOne(updateDto, {
      where: { _id: userId },
    });
    if (!updatedUser) {
      throw ApiError.NotFound('Người dùng không tồn tại');
    }
    return updatedUser;
  }
}
