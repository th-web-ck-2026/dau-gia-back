import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from "@/common/constants/base.constant";
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';
import { User } from '@/modules/user/entities/user.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Is } from 'sequelize-typescript';

export class Review implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString()
  enrollment_id: string;
  @IsString()
  reviewer_id: string;
  @ApiHideProperty()
  reviewer?: User;
  @IsString()
  reviewee_id: string;
  @ApiHideProperty()
  reviewee?: User;
  @IsString()
  class_id: string;
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
  @IsNotEmpty()
  comment: string;
}
