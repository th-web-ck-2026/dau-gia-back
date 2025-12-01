import { OmitType } from '@nestjs/swagger';
import { ThongTinThanhToan } from '../entities/thong-tin-thanh-toan.entity';

export class CreateThongTinThanhToanDto extends OmitType(ThongTinThanhToan, [
  '_id',
  'userId',
]) {}
