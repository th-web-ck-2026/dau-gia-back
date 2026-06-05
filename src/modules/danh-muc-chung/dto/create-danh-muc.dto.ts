import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDanhMucDto {
  @ApiProperty({ description: 'Mã loại danh mục' })
  @IsString()
  @IsNotEmpty()
  maLoai: string;

  @ApiProperty({ description: 'Tên danh mục' })
  @IsString()
  @IsNotEmpty()
  ten: string;

  @ApiProperty({ description: 'Ảnh danh mục (tùy chọn)', required: false })
  @IsString()
  @IsOptional()
  anh?: string;
}
