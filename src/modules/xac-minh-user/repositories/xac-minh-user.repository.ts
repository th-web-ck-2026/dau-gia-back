import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { XacMinhUser } from '../entities/xac-minh-user.entity';
import { XacMinhUserModel } from '../models/xac-minh-user.model';
@Injectable()
export class XacMinhUserRepository extends BaseRepository<XacMinhUser> {
  constructor() {
    super(XacMinhUserModel);
  }

}
