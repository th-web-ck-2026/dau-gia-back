import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrangThaiPhien } from '@/modules/scoring/common/constants';
import { PartialType } from '@nestjs/swagger';
import { CreateAuctionSessionDto } from './create-auction-session.dto';

export class ConditionAuctionSessionDto extends PartialType(CreateAuctionSessionDto) {
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
