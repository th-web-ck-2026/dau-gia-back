import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateLoaiDanhMucDto {
  @ApiProperty({ description: 'Tên loại danh mục' })
  @IsString()
  @IsNotEmpty()
  ten: string;

  @ApiProperty({ description: 'Mã loại danh mục (viết liền, hoa, không dấu)' })
  @IsString()
  @IsNotEmpty()
  ma: string;
}
