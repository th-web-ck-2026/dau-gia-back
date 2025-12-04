import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { NotificationType } from '../common/constant';

export class Notification implements BaseEntity {
  @StrObjectId()
  _id: string;
  @IsString({ each: true })
  userIds: string[];
  @IsEnum(NotificationType)
  type: NotificationType;
  @IsString()
  title: string;
  @IsString()
  content: string;

  @IsString({ each: true })
  userReadIds: string[];

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
