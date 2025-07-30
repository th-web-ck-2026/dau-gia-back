import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { PageableDto } from '@Common/dto/pageable.dto';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { ApiError } from '@Common/exceptions/api-error';

@Injectable()
export class NotificationService extends BaseService<Notification> {
  constructor(private readonly notificationRepository: NotificationRepository) {
    super(notificationRepository);
  }
  async createNotification(
    createDto: CreateNotificationDto,
  ): Promise<Notification> {
    return this.notificationRepository.create(createDto);
  }
  async getMyNotifications(
    userId: string,
    query: QueryOption,
  ): Promise<PageableDto<Notification>> {
    return this.getPage(
      {
        where: { user_id: userId },
      },
      query,
    );
  }
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.getOne({
      where: { _id: notificationId, user_id: userId },
    });
    if (!notification) {
      throw ApiError.NotFound('Notification not found');
    }
    if (notification.is_read) {
      throw ApiError.Conflict('Notification already marked as read');
    }
    return this.notificationRepository.updateOne(
      { is_read: true },
      { where: { _id: notificationId, user_id: userId } },
    );
  }
  // mark all notifications as read
  async markAllAsRead(userId: string): Promise<void> {
    const notifications = await this.notificationRepository.getMany({
      where: { user_id: userId},
    });
    console.log("notifications: ",notifications);
    if (notifications.length === 0) {
      throw ApiError.NotFound('No unread notifications found');
    }
    await this.notificationRepository.updateMany(
      { is_read: true },
      { where: { user_id: userId, is_read: false } },
    );
  }

}
