import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { XacMinhUser } from '../entities/xac-minh-user.entity';
import { XacMinhUserRepository } from '../repositories/xac-minh-user.repository';
import { CreateXacMinhUserDto } from '../dto/create-xac-minh-user.dto';
import { UpdateXacMinhUserDto } from '../dto/update-xac-minh-user.dto';

@Injectable()
export class XacMinhUserService extends BaseService<XacMinhUser> {
  constructor(private readonly xacMinhUserRepository: XacMinhUserRepository) {
    super(xacMinhUserRepository);
  }

}
