import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { KyThanhToan } from '../entities/ky-thanh-toan.entity';
import { KyThanhToanModel } from '../models/ky-thanh-toan.model';
@Injectable()
export class KyThanhToanRepository extends BaseRepository<KyThanhToan> {
  constructor() {
    super(KyThanhToanModel);
  }

}
