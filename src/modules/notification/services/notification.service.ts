import { Injectable } from '@nestjs/common';
import { BaseService } from '@Base/base.service';
import { Notification } from '../entities/notification.entity';
import { NotificationRepository } from '../repositories/notification.repository';
import { CreateNotificationDto } from '../dto/create-notification.dto';
import { PageableDto } from '@Common/dto/pageable.dto';
import { QueryOption } from '@Common/pipe/query-option.interface';
import { ApiError } from '@Common/exceptions/api-error';
import { Op } from 'sequelize';
import { AuthUser } from '@/common/interfaces/auth-user.interface';

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
    // add total unread notifications
    const totalUnread = await this.notificationRepository.count({
      where: {
        userIds: { [Op.contains]: [userId] },
        userReadIds: { [Op.notIn]: [userId] },
      },
    });
    const pageable = (await this.getPage(
      {
        where: { userIds: { [Op.contains]: [userId] } },
      },
      query,
    )) as unknown as PageableDto<Notification & { totalUnread: number }>;
    (pageable as any).totalUnread = totalUnread;
    return pageable;
  }
  async getMeById(
    user: AuthUser,
    notificationId: string,
  ): Promise<Notification> {
    return this.notificationRepository.getOne({
      where: {
        _id: notificationId,
        userIds: { [Op.contains]: [user.id] },
      },
    });
  }
  async markAsRead(
    userId: string,
    notificationId: string,
  ): Promise<Notification> {
    const notification = await this.notificationRepository.getOne({
      where: {
        _id: notificationId,
        userIds: { [Op.contains]: [userId] },
      },
    });

    if (!notification) {
      throw ApiError.NotFound('Thông báo không tồn tại');
    }

    const currentReadIds = notification.userReadIds || [];
    if (currentReadIds.includes(userId)) {
      return notification;
    }

    const nextReadIds = [...currentReadIds, userId];
    return this.notificationRepository.updateOne(
      { userReadIds: nextReadIds },
      {
        where: { _id: notificationId },
      },
    );
  }

  // mark all notifications as read
  async markAllAsRead(userId: string): Promise<{ n: number }> {
    // Lấy tất cả notification của user
    const notifications = await this.notificationRepository.getMany({
      where: {
        userIds: { [Op.contains]: [userId] },
      },
    });

    let updated = 0;

    for (const noti of notifications) {
      const currentReadIds = noti.userReadIds || [];

      if (currentReadIds.includes(userId)) {
        continue;
      }

      const nextReadIds = [...currentReadIds, userId];
      await this.notificationRepository.updateOne(
        { userReadIds: nextReadIds },
        { where: { _id: noti._id } },
      );
      updated += 1;
    }

    return { n: updated };
  }
}
