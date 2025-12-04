import { OmitType } from '@nestjs/swagger';
import { YeuCauBaoTriBaoDuong } from '../entities/yeu-cau-bao-tri-bao-duong.entity';

export class CreateYeuCauBaoTriBaoDuongDto extends OmitType(
  YeuCauBaoTriBaoDuong,
  [
    '_id',
    'ngayHoanThanh',
    'ngayHuy',
    'trangThai',
    'userId',
    'khachHangUserId',
    'ngayTiepNhan',
    'ngayDuKienHoanThanh',
    'lyDoHuy',
  ],
) {}
