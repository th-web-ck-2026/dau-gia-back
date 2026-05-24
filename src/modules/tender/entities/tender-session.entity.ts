import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

export class TenderSession implements BaseEntity {
  _id: string;
  tieuDe: string;
  moTa?: string;
  chuPhienId: string;
  trangThai: TrangThaiPhien;
  thoiGianBatDau: Date;
  thoiGianKetThuc: Date;
  giaToiDa?: number;
  trongSoKyThuat: number;
  trongSoGia: number;
  diemKyThuatToiThieu: number;
  anDanh: boolean;
  thoiDiemCongBo?: Date;
  thoiDiemDong?: Date;
  deXuatThangId?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
