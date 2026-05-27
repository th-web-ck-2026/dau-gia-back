import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { PartialType } from '@nestjs/swagger';
import { CreateTenderSessionDto } from './create-tender-session.dto';

export class ConditionTenderSessionDto extends PartialType(CreateTenderSessionDto) {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  chuPhienId?: string;

  @IsEnum(TrangThaiPhien)
  @IsOptional()
  trangThai?: TrangThaiPhien;
}
