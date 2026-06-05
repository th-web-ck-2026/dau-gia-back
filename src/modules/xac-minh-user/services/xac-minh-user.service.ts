import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { XacMinhUser } from '../entities/xac-minh-user.entity';
import { XacMinhUserRepository } from '../repositories/xac-minh-user.repository';
import { CreateXacMinhUserDto } from '../dto/create-xac-minh-user.dto';
import { User } from '@/modules/user/entities/user.entity';
import { TrangThaiXacMinhUser } from '../common/constant';
import { ApiError } from '@/common/exceptions/api-error';
import { AdminDuyetDonXacMinhDto } from '../dto/admin-duyet.dto';
import { UsersService } from '@/modules/user/services/user.service';

@Injectable()
export class XacMinhUserService extends BaseService<XacMinhUser> {
  constructor(private readonly xacMinhUserRepository: XacMinhUserRepository,
    private readonly userService: UsersService
  ) {
    super(xacMinhUserRepository);
  }
  async getMe(user: User) {
    return this.xacMinhUserRepository.getOne({
      where: {
        userId: user._id,
      },
      order: [['createdAt', 'desc']]
    });
  }
  async createMe(
    user: User,
    createDto: CreateXacMinhUserDto,
  ): Promise<XacMinhUser> {
    const existingUser = await this.xacMinhUserRepository.getOne({
      where: {
        userId: user._id,
        trangThai: TrangThaiXacMinhUser.CHO_DUYET,
      },
    });

    if (existingUser) {
      throw ApiError.BadRequest('error-user-already-pending-verified');
    }
    const userXacMinh = await this.xacMinhUserRepository.create({
      userId: user._id,
      ...createDto,
    });
    return userXacMinh;
  }
  async adminDuyetDon(
    id: string,
    dto: AdminDuyetDonXacMinhDto,
  ): Promise<XacMinhUser> {
    const userXacMinh = await this.xacMinhUserRepository.getById(id);
    if (!userXacMinh) {
      throw ApiError.NotFound('error-user-not-found');
    }
    if(dto.trangThai === TrangThaiXacMinhUser.DUYET){
      await this.userService.updateOne({
        isVerified: true,
      }, {
        where: {
          _id: userXacMinh.userId,
        }
      })
    }
    return this.xacMinhUserRepository.updateOne(
      {
        ...dto,
        ngayXacMinh: new Date(),
      },
      {
        where: {
          _id: id,
        },
      },
    );
  }
}
