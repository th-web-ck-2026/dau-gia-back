import { BaseEntity } from '@/common/interfaces/base-entity.interface';

export class TenderSubmissionValue implements BaseEntity {
  _id: string;
  deXuatId: string;
  tieuChiId: string;
  giaTriSo?: number;
  giaTriChuoi?: string;
  giaTriGoc: any;
  diemChuanHoa?: number;
  diemCoTrongSo?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
