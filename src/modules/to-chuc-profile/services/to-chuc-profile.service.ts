import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { ToChucProfile } from '../entities/to-chuc-profile.entity';
import { ToChucProfileRepository } from '../repositories/to-chuc-profile.repository';
import { CreateToChucProfileDto } from '../dto/create-to-chuc-profile.dto';
import { UpdateToChucProfileDto } from '../dto/update-to-chuc-profile.dto';
import { User } from '@/modules/user/entities/user.entity';
import { UsersService } from '@/modules/user/services/user.service';

@Injectable()
export class ToChucProfileService extends BaseService<ToChucProfile> {
  constructor(
    private readonly toChucProfileRepository: ToChucProfileRepository,
    private readonly userService: UsersService,
  ) {
    super(toChucProfileRepository);
  }
  async updateMe(user: User, dto: UpdateToChucProfileDto) {
    const res = await this.toChucProfileRepository.updateOne(dto, {
      where: {
        userId: user._id,
      },
    });
    if (res) {
      if (dto.tenToChuc) {
        await this.userService.updateOne(
          {
            tenToChuc: dto.tenToChuc,
          },
          {
            where: {
              _id: user._id,
            },
          },
        );
      }
    }
    return res;
  }
}
