import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { DongThueTheo, HopDongTrangThai } from '../common/constant';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { DichVuThue } from '../dto/dich-vu-thue.dto';
import { Unit } from '@/modules/unit/entities/unit.entity';

export class HopDongThue implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  code: string;
  @IsString()
  unitId: string;
  @IsString()
  userId: string;
  @IsString()
  khachHangUserId: string;
  @IsDateString()
  ngayBatDauThue: Date;
  @IsDateString()
  ngayKetThucThue: Date;
  @IsNumber()
  giaThue: number;
  @IsEnum(DongThueTheo)
  dongThueTheo: DongThueTheo;
  @IsNumber()
  chuKyDongThue: number;
  @IsNumber()
  soThangThue: number;
  @ValidateNested({ each: true })
  @Type(() => DichVuThue)
  @IsArray()
  dichVuThues: DichVuThue[];
  @IsNumber()
  @IsOptional()
  tienDatCoc?: number;

  @IsString()
  @IsOptional()
  dieuKhoanDichVu?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hinhAnh?: string[];

  @IsString()
  @IsOptional()
  cccdKhachHang?: string;

  @IsString()
  @IsOptional()
  anhCccdKhachHangTruoc?: string;

  @IsString()
  @IsOptional()
  anhCccdKhachHangSau?: string;

  @IsString()
  @IsOptional()
  ghiChu?: string;
  @IsEnum(HopDongTrangThai)
  trangThai: HopDongTrangThai;
  unit?: Unit;
}
