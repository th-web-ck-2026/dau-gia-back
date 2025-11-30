import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { HopDongThue } from '../entities/hop-dong-thue.entity';
import { HopDongThueModel } from '../models/hop-dong-thue.model';
@Injectable()
export class HopDongThueRepository extends BaseRepository<HopDongThue> {
  constructor() {
    super(HopDongThueModel);
  }

}
