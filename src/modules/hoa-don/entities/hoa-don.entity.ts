import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import {
  HoaDonType,
  HoaDonTrangThai,
  HoaDonTrangThaiKhachHangThanhToan,
} from '../common/constant';
import {
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsDateString,
  IsObject,
  ValidateNested,
  IsArray,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { DichVuHoaDon } from '../dto/dich-vu-hoa-don.dto';
import { HdtThongTinThanhToanDto } from '@/modules/thong-tin-thanh-toan/dto/hd-thong-tin-thanh-toan.dto';


export class HoaDon implements BaseEntity {
  @StrObjectId()
  _id: string;

  @IsString()
  hopDongThueId: string;
  

  @IsString()
  kyThanhToanId: string;

  @IsString()
  khachHangUserId: string;

  @IsEnum(HoaDonType)
  loaiHoaDon: HoaDonType;

  @IsString()
  @IsOptional()
  maHoaDon?: string;

  @IsDateString()
  @IsOptional()
  ngayThanhToan?: Date;

  @IsDateString()
  @IsOptional()
  hanThanhToan?: Date;

  @ValidateNested({ each: true })
  @Type(() => DichVuHoaDon)
  @IsArray()
  dichVus: DichVuHoaDon[];

  @IsNumber()
  tongTien: number;

  @IsString()
  @IsOptional()
  ghiChu?: string;

  @IsEnum(HoaDonTrangThai)
  trangThai: HoaDonTrangThai;

  @IsEnum(HoaDonTrangThaiKhachHangThanhToan)
  trangThaiKhachHangThanhToan: HoaDonTrangThaiKhachHangThanhToan;

  @IsBoolean()
  @IsOptional()
  trangThaiQuaHan?: boolean;

  @IsDateString()
  @IsOptional()
  ngayKhachHangThanhToan?: Date;

  @IsDateString()
  @IsOptional()
  ngayXacNhanThanhToan?: Date;

  @ValidateNested()
  @Type(() => HdtThongTinThanhToanDto)
  thongTinThanhToan: HdtThongTinThanhToanDto;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  khachHangGhiChu?: string;
}
