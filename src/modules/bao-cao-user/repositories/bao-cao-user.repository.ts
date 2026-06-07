import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { BaoCaoUser } from '../entities/bao-cao-user.entity';
import { BaoCaoUserModel } from '../models/bao-cao-user.model';
@Injectable()
export class BaoCaoUserRepository extends BaseRepository<BaoCaoUser> {
  constructor() {
    super(BaoCaoUserModel);
  }

}
