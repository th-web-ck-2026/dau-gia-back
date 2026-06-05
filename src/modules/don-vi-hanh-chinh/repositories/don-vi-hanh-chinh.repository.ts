import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { DonViHanhChinh } from '../entities/don-vi-hanh-chinh.entity';
import { DonViHanhChinhModel } from '../models/don-vi-hanh-chinh.model';
@Injectable()
export class DonViHanhChinhRepository extends BaseRepository<DonViHanhChinh> {
  constructor() {
    super(DonViHanhChinhModel);
  }

}
