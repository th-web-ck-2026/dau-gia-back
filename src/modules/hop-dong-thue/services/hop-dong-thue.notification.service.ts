import { NotificationType } from '@/modules/notification/common/constant';
import { NotificationService } from '@/modules/notification/services/notification.service';
import { Injectable } from '@nestjs/common';
import { HopDongThue } from '../entities/hop-dong-thue.entity';

@Injectable()
export class HopDongThueNotificationService {
  constructor(private readonly notificationService: NotificationService) {}
  async hopDongThueDuocKichHoat(hopDongThue: HopDongThue) {
    await this.notificationService.createNotification({
      userIds: [hopDongThue.khachHangUserId, hopDongThue.userId],
      type: NotificationType.HE_THONG,
      title: 'Hợp đồng thuê đã được kích hoạt',
      content: 'Hợp đồng thuê đã được kích hoạt',
    });
  }
  async hopDongThueDuocHuy(hopDongThue: HopDongThue) {
    await this.notificationService.createNotification({
      userIds: [hopDongThue.khachHangUserId, hopDongThue.userId],
      type: NotificationType.HE_THONG,
      title: 'Hợp đồng thuê đã được hủy',
      content: 'Hợp đồng thuê đã được hủy',
    });
  }
}
