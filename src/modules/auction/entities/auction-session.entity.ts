import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuctionSession implements BaseEntity {
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
  giaKhoiDiem: number;

  @ApiProperty()
  buocGia: number;

  @ApiPropertyOptional()
  giaTran?: number;

  @ApiProperty()
  trongSoGia: number;

  @ApiProperty()
  trongSoUyTin: number;

  @ApiPropertyOptional()
  trongSoCamKet?: number;

  @ApiPropertyOptional()
  deXuatThangId?: string;

  @ApiPropertyOptional()
  giaCaoNhat?: number;

  @ApiProperty({ type: [String] })
  danhSachHinhAnh: string[];

  @ApiProperty()
  anDanh: boolean;

  @ApiProperty()
  soLuongNguoiThamGia: number;

  @ApiPropertyOptional()
  thoiDiemDong?: Date;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
