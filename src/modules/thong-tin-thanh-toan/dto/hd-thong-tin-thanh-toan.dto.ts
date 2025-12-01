import { ThongTinThanhToan } from '../entities/thong-tin-thanh-toan.entity';
import { OmitType } from '@nestjs/swagger';

export class HdtThongTinThanhToanDto extends OmitType(ThongTinThanhToan, [
  '_id',
  'userId',
]) {}
