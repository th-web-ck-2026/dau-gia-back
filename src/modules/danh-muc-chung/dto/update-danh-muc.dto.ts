import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateDanhMucDto {
  @ApiProperty({ description: 'Mã loại danh mục', required: false })
  @IsString()
  @IsOptional()
  maLoai?: string;

  @ApiProperty({ description: 'Tên danh mục', required: false })
  @IsString()
  @IsOptional()
  ten?: string;

  @ApiProperty({ description: 'Ảnh danh mục (tùy chọn)', required: false })
  @IsString()
  @IsOptional()
  anh?: string;
}
