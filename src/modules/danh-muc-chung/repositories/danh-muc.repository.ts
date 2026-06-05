import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { DanhMuc } from '../entities/danh-muc.entity';
import { DanhMucModel } from '../models/danh-muc.model';

@Injectable()
export class DanhMucRepository extends BaseRepository<DanhMuc> {
  constructor() {
    super(DanhMucModel);
  }
}
