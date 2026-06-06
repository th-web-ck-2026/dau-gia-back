import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TenderCriteria } from './tender-criteria.entity';

export class TenderSession implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  tieuDe: string;

  @ApiPropertyOptional()
  moTa?: string;

  @ApiProperty()
  chuPhienId: string;

  @ApiProperty({ enum: TrangThaiPhien })
  trangThai: TrangThaiPhien;

  @ApiProperty()
  thoiGianBatDau: Date;

  @ApiProperty()
  thoiGianKetThuc: Date;


  @ApiProperty()
  diemKyThuatToiThieu: number;

  @ApiProperty({ type: [String] })
  danhSachHinhAnh: string[];

  @ApiProperty()
  anDanh: boolean;

  @ApiProperty()
  soLuongNguoiThamGia: number;

  @ApiPropertyOptional()
  thoiDiemCongBo?: Date;

  @ApiPropertyOptional()
  thoiDiemDong?: Date;

  @ApiPropertyOptional()
  deXuatThangId?: string;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}

export class TenderSessionDetails extends TenderSession {
  @ApiProperty({ type: [TenderCriteria] })
  tieuChi: TenderCriteria[];
}

