import { IsString, IsOptional } from 'class-validator';
import { PartialType } from '@nestjs/swagger';
import { CreateDanhMucDto } from './create-danh-muc.dto';

export class ConditionDanhMucDto extends PartialType(CreateDanhMucDto) {
  @IsString()
  @IsOptional()
  _id?: string;
}
