import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TrangThaiXacMinhUser } from '../common/constant';

export class ConditionXacMinhUserDto {
  @IsString()
  @IsOptional()
  _id?: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsEnum(TrangThaiXacMinhUser)
  @IsOptional()
  trangThai?: TrangThaiXacMinhUser;
}
