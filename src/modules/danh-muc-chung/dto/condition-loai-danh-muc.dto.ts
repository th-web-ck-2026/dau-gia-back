import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateLoaiDanhMucDto } from './create-loai-danh-muc.dto';

export class ConditionLoaiDanhMucDto extends PartialType(CreateLoaiDanhMucDto) {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean;
}
