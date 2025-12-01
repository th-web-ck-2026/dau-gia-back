import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { ThongTinThanhToan } from '../entities/thong-tin-thanh-toan.entity';
import { ThongTinThanhToanModel } from '../models/thong-tin-thanh-toan.model';
@Injectable()
export class ThongTinThanhToanRepository extends BaseRepository<ThongTinThanhToan> {
  constructor() {
    super(ThongTinThanhToanModel);
  }

}
