import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { LoaiDanhMuc } from './loai-danh-muc.entity';

export class DanhMuc implements BaseEntity {
  _id: string;
  maLoai: string;
  ten: string;
  anh?: string;
  loaiDanhMuc?: LoaiDanhMuc;
  createdAt?: Date;
  updatedAt?: Date;
}
