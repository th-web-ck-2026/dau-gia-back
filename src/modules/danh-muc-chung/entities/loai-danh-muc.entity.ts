import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LoaiDanhMuc implements BaseEntity {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  ten: string;

  @ApiProperty()
  ma: string;

  @ApiProperty()
  isDefault: boolean;

  danhMucs?: any[];
}
