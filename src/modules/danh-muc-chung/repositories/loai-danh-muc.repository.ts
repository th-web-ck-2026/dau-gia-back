import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { LoaiDanhMuc } from '../entities/loai-danh-muc.entity';
import { LoaiDanhMucModel } from '../models/loai-danh-muc.model';

@Injectable()
export class LoaiDanhMucRepository extends BaseRepository<LoaiDanhMuc> {
  constructor() {
    super(LoaiDanhMucModel);
  }
}
