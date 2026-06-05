import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { DanhMuc } from './danh-muc.entity';

export class LoaiDanhMuc implements BaseEntity {
  _id: string;
  ten: string;
  ma: string;
  isDefault: boolean;
  danhMucs?: DanhMuc[];
  createdAt?: Date;
  updatedAt?: Date;
}
