import { OmitType } from '@nestjs/swagger';
import { HoaDon } from '../entities/hoa-don.entity';

export class CreateHoaDonDto extends OmitType(HoaDon, [
  '_id',
  'userId',
  'khachHangUserId',
  'trangThai',
]) {}
