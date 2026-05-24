import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';

export class TenderCriteria implements BaseEntity {
  _id: string;
  phienId: string;
  tenTieuChi: string;
  maTieuChi: string;
  nhom: 'sang_loc' | 'ky_thuat' | 'thuong_mai' | 'gia_tri' | 'rui_ro';
  loai: LoaiTieuChi;
  trongSo: number;
  huongToiUu: HuongToiUu;
  batBuoc: boolean;
  rangBuocCung: boolean;
  cacLuaChon?: Array<{ nhan: string; giaTri: string; diem: number }>;
  giaTriToiThieu?: number;
  giaTriToiDa?: number;
  donVi?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
