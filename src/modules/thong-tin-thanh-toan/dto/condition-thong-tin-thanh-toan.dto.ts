import { PartialType } from '@nestjs/mapped-types';
import { ThongTinThanhToan } from '../entities/thong-tin-thanh-toan.entity';

export class ConditionThongTinThanhToanDto extends PartialType(
  ThongTinThanhToan,
) {}
