import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { IsEnum, IsString } from 'class-validator';
import { UnitType, UnitTrangThaiThue } from '../common/constant';

export class Unit implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  code: string;
  @IsString()
  propertieId: string;
  @IsString()
  ten: string;
  @IsString()
  moTa: string;
  @IsEnum(UnitType)
  type: UnitType;
  @IsEnum(UnitTrangThaiThue)
  trangThaiThue: UnitTrangThaiThue;
}
