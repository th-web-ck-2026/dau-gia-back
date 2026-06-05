import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { ToChucProfile } from '../entities/to-chuc-profile.entity';
import { ToChucProfileModel } from '../models/to-chuc-profile.model';
@Injectable()
export class ToChucProfileRepository extends BaseRepository<ToChucProfile> {
  constructor() {
    super(ToChucProfileModel);
  }

}
