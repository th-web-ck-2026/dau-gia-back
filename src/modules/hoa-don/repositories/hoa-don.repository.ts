import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { HoaDon } from '../entities/hoa-don.entity';
import { HoaDonModel } from '../models/hoa-don.model';
@Injectable()
export class HoaDonRepository extends BaseRepository<HoaDon> {
  constructor() {
    super(HoaDonModel);
  }

}
