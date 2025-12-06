import { KyThanhToanTrangThai } from '../common/constant';

import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';

export class KyThanhToanDto {
  @IsString()
  ten: string;
  @IsDateString()
  ngayBatDauThanhToan: Date;
  @IsDateString()
  ngayKetThucThanhToan: Date;
  @IsEnum(KyThanhToanTrangThai)
  trangThai: KyThanhToanTrangThai;
  @IsString()
  @IsOptional()
  ghiChu?: string;
}
