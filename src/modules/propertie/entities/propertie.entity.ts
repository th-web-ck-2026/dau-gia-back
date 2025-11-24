import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { PropertieType } from '../common/constant';

export class Propertie implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  userId: string;
  @IsString()
  code: string;
  @IsString()
  ten: string;
  @IsEnum(PropertieType)
  type: PropertieType;
  @IsString()
  diaChi: string;
  @IsString()
  @IsOptional()
  tinhThanhPho?: string;
  @IsString()
  moTa: string;
}
