import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { BidStatus } from '../common/constant';
import { Class } from '@/modules/class/entities/class.entity';
import { ApiHideProperty } from '@nestjs/swagger';

export class Bid implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  class_id: string;
  @ApiHideProperty()
  class?: Class;
  @IsString()
  student_id: string;
  @ApiHideProperty()
  student?: any;
  @IsNumber()
  bid_price: number;
  @IsOptional()
  message?: string;
  @IsOptional()
  @IsString()
  address?: string;
  @IsEnum(BidStatus)
  status: BidStatus;
}
