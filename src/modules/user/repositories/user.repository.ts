import { Injectable } from '@nestjs/common';
import { BaseRepository } from '../../../common/base/base.repository';
import { User } from '../entities/user.entity';
import { UserModel } from '../models/user.model';
import { ApiError } from '@/common/exceptions/api-error';
import { InjectModel } from '@nestjs/sequelize';
import { UserRoles } from '../common/constant';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(
  ) {
    super(UserModel);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.getOne({ where: { email } });
  }

  async findActiveUsers(): Promise<User[]> {
    return this.getMany({ where: { isActive: true } });
  }
  async getInfo(userId: string): Promise<Pick<User, 'phone' | 'email'>> {
    const user = await this.getOne({ where: { _id: userId } });
    if (!user) {
      throw ApiError.NotFound('User not found');
    }
    return {
      phone: user.phone,
      email: user.email,
    };
  }
}
