import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { IsDateString, IsEnum, IsOptional, IsString } from 'class-validator';
import { KyThanhToanTrangThai } from '../common/constant';
import { HopDongThue } from './hop-dong-thue.entity';
import { ApiHideProperty } from '@nestjs/swagger';
export class KyThanhToan implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  hopDongThueId: string;
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

  @ApiHideProperty()
  hopDongThue?: HopDongThue;
}
