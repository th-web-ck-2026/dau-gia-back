import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiDeXuat } from '@/modules/scoring/common/constants';

export class AuctionBid implements BaseEntity {
  _id: string;
  phienId: string;
  nguoiThamGiaId: string;
  giaDat: number;
  diemUyTin: number;
  diemCamKet?: number;
  diemChuanHoaGia?: number;
  diemTongHop?: number;
  trangThai: TrangThaiDeXuat;
  thuHang?: number;
  thoiDiemDat: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
