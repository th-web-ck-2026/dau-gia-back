import { PickType } from '@nestjs/swagger';
import { HoaDon } from '../entities/hoa-don.entity';

export class ThanhToanHoaDonChoThueDto extends PickType(HoaDon, [
  'trangThai',
]) {}
