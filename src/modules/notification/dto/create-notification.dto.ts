import { PickType } from '@nestjs/swagger';
import { Notification as NotificationEntity } from '../entities/notification.entity';
export class CreateNotificationDto extends PickType(NotificationEntity, [
  'userIds',
  'type',
  'title',
  'content',
  'metadata',
]) {}
