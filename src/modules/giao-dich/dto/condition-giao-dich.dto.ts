import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LoaiPhien } from '@/modules/scoring/common/constants';
import { TrangThaiGiaoDich } from '../common/constants';

export class ConditionGiaoDichDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsEnum(LoaiPhien)
  @IsOptional()
  loaiPhien?: LoaiPhien;

  @IsEnum(TrangThaiGiaoDich)
  @IsOptional()
  trangThai?: TrangThaiGiaoDich;
}
