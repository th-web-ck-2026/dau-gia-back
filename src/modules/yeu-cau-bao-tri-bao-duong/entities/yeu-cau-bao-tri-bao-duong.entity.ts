import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { MucDoUuTien, YeuCauBaoTriBaoDuongLoai, YeuCauBaoTriBaoDuongTrangThai } from '../common/constant';
import { IsDateString, IsEnum, IsOptional } from 'class-validator';
import { IsString } from 'class-validator';

export class YeuCauBaoTriBaoDuong implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  userId: string;
  @IsString()
  khachHangUserId: string;
  @IsString()
  unitId: string;
  @IsEnum(YeuCauBaoTriBaoDuongLoai)
  loaiYeuCau: YeuCauBaoTriBaoDuongLoai;
  @IsString()
  noiDungYeuCau: string;
  @IsString({ each: true })
  @IsOptional()
  hinhAnh?: string[];
  @IsDateString()
  ngayTiepNhan?: Date;
  @IsDateString()
  ngayDuKienHoanThanh?: Date;
  @IsDateString()
  ngayHoanThanh?: Date;
  @IsDateString()
  ngayHuy?: Date;
  @IsString()
  @IsOptional()
  lyDoHuy?: string;
  @IsEnum(YeuCauBaoTriBaoDuongTrangThai)
  trangThai: YeuCauBaoTriBaoDuongTrangThai;
  @IsEnum(MucDoUuTien)
  mucDoUuTien: MucDoUuTien;
}
