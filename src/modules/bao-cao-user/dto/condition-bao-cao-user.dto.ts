import { IsEnum, IsOptional, IsString } from 'class-validator';
import { LoaiBaoCao, TrangThaiBaoCao } from '../common/constants';

export class ConditionBaoCaoUserDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  nguoiToCaoId?: string;

  @IsString()
  @IsOptional()
  nguoiBiToCaoId?: string;

  @IsEnum(LoaiBaoCao)
  @IsOptional()
  loai?: LoaiBaoCao;

  @IsEnum(TrangThaiBaoCao)
  @IsOptional()
  trangThai?: TrangThaiBaoCao;
}
