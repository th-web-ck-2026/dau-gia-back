import { TenantTrangThaiPhanHoi } from '../common/constant';
import { IsEnum } from 'class-validator';

export class PhanHoiYeuCauChoThueDto {
  @IsEnum(TenantTrangThaiPhanHoi)
  trangThai: TenantTrangThaiPhanHoi;
}