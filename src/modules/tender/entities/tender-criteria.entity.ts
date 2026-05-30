import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { LoaiTieuChi, HuongToiUu } from '@/modules/scoring/common/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class TenderCriteria implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  phienId: string;

  @ApiProperty()
  tenTieuChi: string;

  @ApiProperty()
  maTieuChi: string;

  @ApiProperty()
  nhom: 'sang_loc' | 'ky_thuat' | 'thuong_mai' | 'gia_tri' | 'rui_ro';

  @ApiProperty({ enum: LoaiTieuChi })
  loai: LoaiTieuChi;

  @ApiProperty()
  trongSo: number;

  @ApiProperty({ enum: HuongToiUu })
  huongToiUu: HuongToiUu;

  @ApiProperty()
  batBuoc: boolean;

  @ApiProperty()
  rangBuocCung: boolean;

  @ApiPropertyOptional()
  cacLuaChon?: Array<{ nhan: string; giaTri: string; diem: number }>;

  @ApiPropertyOptional()
  giaTriToiThieu?: number;

  @ApiPropertyOptional()
  giaTriToiDa?: number;

  @ApiPropertyOptional()
  donVi?: string;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
