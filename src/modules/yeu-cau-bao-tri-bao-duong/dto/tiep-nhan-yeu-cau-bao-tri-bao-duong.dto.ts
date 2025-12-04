import { IsDateString } from 'class-validator';

export class TiepNhanYeuCauBaoTriBaoDuongDto {
  @IsDateString()
  ngayDuKienHoanThanh: Date;
}
