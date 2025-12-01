import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { IsOptional, IsString } from 'class-validator';

export class ThongTinThanhToan implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  soTaiKhoan: string;
  @IsString()
  tenTaiKhoan: string;
  @IsString()
  tenNganHang: string;
  @IsString()
  @IsOptional()
  ghiChu?: string;
  @IsString()
  @IsOptional()
  userId?: string;
  @IsString()
  @IsOptional()
  qrImage?: string;
}
