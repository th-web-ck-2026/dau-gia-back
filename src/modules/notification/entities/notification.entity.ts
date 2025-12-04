import { BaseEntity } from '@Common/interfaces/base-entity.interface';
import { StrObjectId } from '@/common/constants/base.constant';
import {
  IsBoolean,
  IsEnum,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { NotificationType } from '../common/constant';
import { MetadataNotificationDto } from '../dto/metadata-notification.dto';
import { Type } from 'class-transformer';

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

  @ValidateNested()
  @Type(() => MetadataNotificationDto)
  @IsOptional()
  metadata?: MetadataNotificationDto;
}
