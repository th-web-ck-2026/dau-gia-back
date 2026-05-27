import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';

export class ConditionAuctionSessionDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  tieuDe?: string;

  @IsString()
  @IsOptional()
  chuPhienId?: string;

  @IsEnum(TrangThaiPhien)
  @IsOptional()
  trangThai?: TrangThaiPhien;

  @IsString()
  @IsOptional()
  thoiGianBatDau?: string;

  @IsString()
  @IsOptional()
  thoiGianKetThuc?: string;
}
