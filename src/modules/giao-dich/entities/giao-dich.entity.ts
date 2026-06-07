import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

export class GiaoDich implements BaseEntity {
  @StrObjectId()
  _id: string;

  phienId: string;
  loaiPhien: LoaiPhien;
  chuPhienId: string;
  nguoiThangId: string;
  trangThai: TrangThaiGiaoDich;

  giaChot?: number;
  hanXacNhan: Date;
  thoiDiemXacNhan?: Date;
  lyDoThatBai?: string;

  // Thanh toán (đấu giá)
  anhChungTu?: string[];
  thoiDiemNguoiThangBaoDaCK?: Date;
  thoiDiemChuPhienXacNhanTien?: Date;

  // Hợp đồng (đấu thầu)
  chuPhienDaKy?: boolean;
  nguoiThangDaKy?: boolean;

  // Bàn giao (đấu thầu)
  daBanGiao?: boolean;
  nguoiThangXacNhanNhan?: boolean;

  // Liên hệ (chung)
  ghiChuLienHeChuPhien?: string;
  ghiChuLienHeNguoiThang?: string;

  thoiDiemHoanTat?: Date;
}
