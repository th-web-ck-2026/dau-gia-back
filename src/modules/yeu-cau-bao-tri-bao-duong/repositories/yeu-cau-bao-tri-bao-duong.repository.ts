import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { YeuCauBaoTriBaoDuong } from '../entities/yeu-cau-bao-tri-bao-duong.entity';
import { YeuCauBaoTriBaoDuongModel } from '../models/yeu-cau-bao-tri-bao-duong.model';
@Injectable()
export class YeuCauBaoTriBaoDuongRepository extends BaseRepository<YeuCauBaoTriBaoDuong> {
  constructor() {
    super(YeuCauBaoTriBaoDuongModel);
  }

}
