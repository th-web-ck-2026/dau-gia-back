import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { TrangThaiDeXuat } from '@/modules/scoring/common/constants';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuctionBid implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  phienId: string;

  @ApiProperty()
  nguoiThamGiaId: string;

  @ApiProperty()
  giaDat: number;


  @ApiPropertyOptional()
  diemChuanHoaGia?: number;

  @ApiPropertyOptional()
  diemTongHop?: number;

  @ApiProperty({ enum: TrangThaiDeXuat })
  trangThai: TrangThaiDeXuat;

  @ApiPropertyOptional()
  thuHang?: number;

  @ApiProperty()
  thoiDiemDat: Date;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
