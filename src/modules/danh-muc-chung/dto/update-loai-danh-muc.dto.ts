import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateLoaiDanhMucDto {
  @ApiProperty({ description: 'Tên loại danh mục', required: false })
  @IsString()
  @IsOptional()
  ten?: string;

  @ApiProperty({ description: 'Mã loại danh mục (viết liền, hoa, không dấu)', required: false })
  @IsString()
  @IsOptional()
  ma?: string;
}
