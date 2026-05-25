import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiDeXuat } from '@/modules/scoring/common/constants';

export class TenderSubmission implements BaseEntity {
  _id: string;
  phienId: string;
  nguoiThamGiaId: string;
  trangThai: TrangThaiDeXuat;
  giaDeXuat: number;
  diemKyThuat?: number;
  diemGia?: number;
  diemTongHop?: number;
  thuHang?: number;
  lyDoTuChoi?: string;
  thoiDiemNop: Date;
  createdAt?: Date;
  updatedAt?: Date;
}
