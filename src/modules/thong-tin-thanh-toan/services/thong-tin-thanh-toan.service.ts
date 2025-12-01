import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { ThongTinThanhToan } from '../entities/thong-tin-thanh-toan.entity';
import { ThongTinThanhToanRepository } from '../repositories/thong-tin-thanh-toan.repository';
import { CreateThongTinThanhToanDto } from '../dto/create-thong-tin-thanh-toan.dto';
import { UpdateThongTinThanhToanDto } from '../dto/update-thong-tin-thanh-toan.dto';

@Injectable()
export class ThongTinThanhToanService extends BaseService<ThongTinThanhToan> {
  constructor(private readonly thongTinThanhToanRepository: ThongTinThanhToanRepository) {
    super(thongTinThanhToanRepository);
  }

}
