import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@Base/base.repository';
import { ThongKe } from '../entities/thong-ke.entity';
import { ThongKeModel } from '../models/thong-ke.model';
@Injectable()
export class ThongKeRepository extends BaseRepository<ThongKe> {
  constructor() {
    super(ThongKeModel);
  }

}
