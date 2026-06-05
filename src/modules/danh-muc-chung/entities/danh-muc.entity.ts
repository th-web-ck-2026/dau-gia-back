import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DanhMuc implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  maLoai: string;

  @ApiProperty()
  ten: string;

  @ApiPropertyOptional()
  anh?: string;

  loaiDanhMuc?: any;
}
