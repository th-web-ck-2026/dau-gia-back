import { IsString, IsNotEmpty, IsOptional, IsEnum, IsDateString, IsNumber, IsBoolean, ValidateNested, IsArray } from 'class-validator';
import { Type } from 'class-transformer';
import { LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';

export class CreateCriteriaDto {
  @IsString()
  @IsNotEmpty()
  tenTieuChi: string;

  @IsString()
  @IsNotEmpty()
  maTieuChi: string;

  @IsString()
  @IsNotEmpty()
  nhom: 'sang_loc' | 'ky_thuat' | 'thuong_mai' | 'gia_tri' | 'rui_ro';

  @IsEnum(LoaiTieuChi)
  loai: LoaiTieuChi;

  @IsNumber()
  trongSo: number;

  @IsEnum(HuongToiUu)
  huongToiUu: HuongToiUu;

  @IsBoolean()
  batBuoc: boolean;

  @IsBoolean()
  rangBuocCung: boolean;

  @IsOptional()
  @IsArray()
  cacLuaChon?: Array<{ nhan: string; giaTri: string; diem: number }>;

  @IsOptional()
  @IsNumber()
  giaTriToiThieu?: number;

  @IsOptional()
  @IsNumber()
  giaTriToiDa?: number;

  @IsOptional()
  @IsString()
  donVi?: string;
}

export class CreateTenderSessionDto {
  @IsString()
  @IsNotEmpty()
  tieuDe: string;

  @IsString()
  @IsOptional()
  moTa?: string;

  @IsDateString()
  thoiGianBatDau: string;

  @IsDateString()
  thoiGianKetThuc: string;

  @IsNumber()
  @IsOptional()
  giaToiDa?: number;

  @IsNumber()
  @IsOptional()
  trongSoKyThuat?: number;

  @IsNumber()
  @IsOptional()
  trongSoGia?: number;

  @IsNumber()
  @IsOptional()
  diemKyThuatToiThieu?: number;

  @IsBoolean()
  @IsOptional()
  anDanh?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  danhSachHinhAnh?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateCriteriaDto)
  tieuChi: CreateCriteriaDto[];
}
