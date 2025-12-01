import { PickType } from '@nestjs/swagger';
import { HoaDon } from '../entities/hoa-don.entity';

export class ThanhToanHoaDonNguoiThueDto extends PickType(HoaDon, [
  'trangThaiKhachHangThanhToan',
]) {}
