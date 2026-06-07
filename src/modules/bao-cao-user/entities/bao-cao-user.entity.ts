import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { LoaiBaoCao, TrangThaiBaoCao } from '../common/constants';

export class BaoCaoUser implements BaseEntity {
  @StrObjectId()
  _id: string;

  @IsString()
  @IsNotEmpty()
  nguoiToCaoId: string;

  @IsString()
  @IsNotEmpty()
  nguoiBiToCaoId: string;

  @IsEnum(LoaiBaoCao)
  loai: LoaiBaoCao;

  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @IsString()
  @IsNotEmpty()
  noiDung: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  danhSachHinhAnh?: string[];

  @IsEnum(TrangThaiBaoCao)
  @IsOptional()
  trangThai?: TrangThaiBaoCao;

  @IsString()
  @IsOptional()
  phanHoiAdmin?: string;

  @IsString()
  @IsOptional()
  adminXuLyId?: string;

  @IsOptional()
  thoiGianXuLy?: Date;
}
