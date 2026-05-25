import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

export class AuctionSession implements BaseEntity {
  _id: string;
  tieuDe: string;
  moTa?: string;
  chuPhienId: string;
  trangThai: TrangThaiPhien;
  thoiGianBatDau: Date;
  thoiGianKetThuc: Date;
  giaKhoiDiem: number;
  buocGia: number;
  giaTran?: number;
  trongSoGia: number;
  trongSoUyTin: number;
  trongSoCamKet?: number;
  deXuatThangId?: string;
  giaCaoNhat?: number;
  anDanh: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
