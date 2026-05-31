import { BaseEntity } from '@/common/interfaces/base-entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AuditLog implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiPropertyOptional()
  nguoiThucHienId?: string;

  @ApiProperty()
  hanhDong: string;

  @ApiProperty()
  loaiDoiTuong: string;

  @ApiProperty()
  doiTuongId: string;

  @ApiPropertyOptional()
  truocKhi?: any;

  @ApiPropertyOptional()
  sauKhi?: any;

  @ApiPropertyOptional()
  duLieuBoSung?: any;

  @ApiPropertyOptional()
  createdAt?: Date;

  @ApiPropertyOptional()
  updatedAt?: Date;
}
